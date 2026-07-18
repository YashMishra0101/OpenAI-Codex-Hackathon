import crypto from 'crypto';
import { geminiClient } from '../config/gemini.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { aiResponseSchema } from '../validations/resumeValidation.js';

/**
 * Bounded in-memory LRU cache for AI responses.
 *
 * Eviction strategy: when the cache reaches MAX_CACHE_SIZE, the oldest entry
 * (first key in insertion order, per Map's guaranteed iteration order) is
 * removed before inserting the new one. This bounds memory usage to roughly
 * MAX_CACHE_SIZE × (avg response size ~10KB) ≈ 1MB maximum.
 *
 * In a production Redis deployment this would be replaced with a TTL-based
 * distributed cache, but for this scale a bounded Map is correct.
 */
const MAX_CACHE_SIZE = 100;
const aiCache = new Map<string, string>();

function setCacheEntry(key: string, value: string): void {
  // If at capacity, evict the oldest entry (first key in insertion order)
  if (aiCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = aiCache.keys().next().value;
    if (oldestKey !== undefined) aiCache.delete(oldestKey);
  }
  aiCache.set(key, value);
}


interface AIAnalysisParams {
  resumeText: string;
  jobDescription?: string;
  searchPreferences?: string;
}

/**
 * The system prompt instructs the AI to return exactly the structured JSON we need.
 */
function buildPrompt(params: AIAnalysisParams): string {
  const { resumeText, jobDescription, searchPreferences } = params;

  let prompt = `You are a strict, senior technical recruiter and career coach.\nAnalyze the following resume`;

  if (jobDescription) {
    prompt += ` against the provided job description.`;
  }
  prompt += `\n\n`;
  prompt += `Resume Text:\n${resumeText}\n\n`;

  if (jobDescription) {
    prompt += `Job Description:\n${jobDescription}\n\n`;
  }

  if (searchPreferences) {
    prompt += `User Search Preferences:\n${searchPreferences}\n\n`;
  }

  prompt += `
Based on your analysis, return a structured JSON response.
Do not output markdown code blocks (like \`\`\`json). Return ONLY raw JSON.

CRITICAL: For "searchQueries", you MUST generate authentic, complex "Google Dorks" (using operators like site:, intitle:, inurl:, filetype:, OR, exact match quotes ""). DO NOT generate simple keywords. These should be ready to paste directly into Google.
Each query MUST be highly specific and relevant to the skills, technologies, and experience level in the resume above.

The JSON object MUST have this exact schema:
{
  "overallVerdict": "Strong" | "Partial" | "Weak",
  "analysis": {
    "strengths": ["...", "..."],
    "improvements": ["...", "..."]
  },
  "interviewQuestions": ["...", "..."], // Exactly 30 tailored questions
  "searchQueries": [ // Generate exactly 15 authentic Google Dork search queries — quality over quantity
    // 8 queries of category "job" — help find relevant job openings based on resume skills & experience
    { "query": "site:lever.co OR site:greenhouse.io intitle:\"Software Engineer\" \"React\"", "category": "job" },
    // 4 queries of category "learning" — help find interview preparation, technical prep, coding resources
    { "query": "site:github.com \"frontend interview questions\" \"react\"", "category": "learning" },
    // 3 queries of category "interview" — help find real interview experiences, candidate stories, hiring process insights
    { "query": "site:reddit.com/r/cscareerquestions \"Google\" \"interview experience\" \"frontend\"", "category": "interview" }
  ]
}
`;

  return prompt;
}

export async function analyzeResume(params: AIAnalysisParams): Promise<any> {
  const prompt = buildPrompt(params);

  // 1. SHA-256 cache key
  const hash = crypto.createHash('sha256').update(prompt).digest('hex');

  if (aiCache.has(hash)) {
    logger.info('AI_CACHE_HIT', { hash });
    return JSON.parse(aiCache.get(hash)!);
  }

  let resultString = '';

  // 2. Try Gemini — rotate through available free-tier models
  const geminiModels = [
    'gemini-3.1-flash-lite',   // Confirmed working on free tier
    'gemini-3.1-flash-image',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ];

  if (geminiClient) {
    for (const modelName of geminiModels) {
      try {
        logger.info('AI_PRIMARY_ATTEMPT', { provider: 'Gemini', model: modelName });
        const response = await geminiClient.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        resultString = response.text || '';
        if (resultString) {
          logger.info('AI_PRIMARY_SUCCESS', { provider: 'Gemini', model: modelName });
          break;
        }
      } catch (err: any) {
        logger.warn('GEMINI_MODEL_FAILED', {
          model: modelName,
          status: err.status,
          error: err.message?.substring(0, 120),
        });
        // 429 quota exhausted or 404 model unavailable — try next model
      }
    }
  }

  // 3. OpenRouter fallback (if all Gemini models failed)
  if (!resultString) {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not initialized');
      }

      logger.info('AI_FALLBACK_ATTEMPT', { provider: 'OpenRouter' });
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/YashMishra0101/OpenAI-Codex-Hackathon',
          'X-Title': 'CodexAI Resume Analyzer'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const completion = await response.json();
      resultString = completion.choices?.[0]?.message?.content || '';
      
      if (resultString) {
        logger.info('AI_FALLBACK_SUCCESS', { provider: 'OpenRouter' });
      }
    } catch (fallbackError: any) {
      logger.error('OPENROUTER_FAILURE_FATAL', { error: fallbackError.message });
      throw new ApiError(
        HTTP.INTERNAL_SERVER_ERROR,
        'AI Providers are currently unavailable. Please try again in a few minutes.',
      );
    }
  }

  // 4. Clean and parse output
  try {
    // Strip markdown code fences if the model added them despite instructions
    let cleaned = resultString.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }

    const parsedData = JSON.parse(cleaned);

    // Validate against strict Zod schema
    const validatedData = aiResponseSchema.parse(parsedData);

    // 5. Cache the validated result
    setCacheEntry(hash, JSON.stringify(validatedData));

    return validatedData;
  } catch (parseError: any) {
    logger.error('AI_RESPONSE_PARSE_ERROR', {
      rawResponse: resultString.substring(0, 500),
      error: parseError.message,
    });
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to parse AI analysis response.');
  }
}

export async function generateInterviewQuestions(
  params: AIAnalysisParams & { numQuestions: number }
): Promise<string[]> {
  const { resumeText, jobDescription, numQuestions } = params;

  let prompt = `You are a strict, senior technical recruiter.\nGenerate EXACTLY ${numQuestions} highly relevant interview questions based on the following resume`;

  if (jobDescription) {
    prompt += ` and job description.`;
  }
  prompt += `\n\nResume Text:\n${resumeText}\n\n`;

  if (jobDescription) {
    prompt += `Job Description:\n${jobDescription}\n\n`;
  }

  prompt += `
Based on your analysis, return a structured JSON response.
Do not output markdown code blocks (like \`\`\`json). Return ONLY raw JSON.

The JSON object MUST have this exact schema:
{
  "interviewQuestions": ["...", "..."] // Exactly ${numQuestions} questions
}
`;

  const hash = crypto.createHash('sha256').update(prompt).digest('hex');

  if (aiCache.has(hash)) {
    logger.info('AI_CACHE_HIT_QUESTIONS', { hash });
    return JSON.parse(aiCache.get(hash)!).interviewQuestions;
  }

  let resultString = '';

  const geminiModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-image',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ];

  if (geminiClient) {
    for (const modelName of geminiModels) {
      try {
        const response = await geminiClient.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        resultString = response.text || '';
        if (resultString) break;
      } catch (err) {
        // next model
      }
    }
  }

  // 3. OpenRouter fallback for interview questions
  if (!resultString) {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not initialized');
      }

      logger.info('AI_FALLBACK_ATTEMPT_QUESTIONS', { provider: 'OpenRouter' });
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/YashMishra0101/OpenAI-Codex-Hackathon',
          'X-Title': 'CodexAI Resume Analyzer'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const completion = await response.json();
      resultString = completion.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      logger.error('OPENROUTER_QUESTIONS_FAILURE', { error: err.message });
      throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'AI Providers are currently unavailable.');
    }
  }

  try {
    let cleaned = resultString.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }
    const parsedData = JSON.parse(cleaned);
    
    const { aiQuestionsResponseSchema } = await import('../validations/resumeValidation.js');
    const validatedData = aiQuestionsResponseSchema.parse(parsedData);
    
    setCacheEntry(hash, JSON.stringify(validatedData));
    return validatedData.interviewQuestions;
  } catch (parseError: any) {
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to parse AI generated questions.');
  }
}
