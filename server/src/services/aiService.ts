import crypto from 'crypto';
import { geminiClient } from '../config/gemini.js';
import { groqClient } from '../config/groq.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { aiResponseSchema } from '../validations/resumeValidation.js';

// Simple in-memory cache to prevent redundant LLM calls
// In production this would be Redis, but for the hackathon MVP, Map is sufficient.
const aiCache = new Map<string, string>();

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

The JSON object MUST have this exact schema:
{
  "overallVerdict": "Strong" | "Partial" | "Weak",
  "analysis": {
    "strengths": ["...", "..."],
    "improvements": ["...", "..."]
  },
  "interviewQuestions": ["...", "..."], // Between 10 and 50 tailored questions
  "searchQueries": [ // Generate exactly 10 advanced Google search queries
    { "query": "...", "category": "job" },       // 8 queries of category "job"
    { "query": "...", "category": "learning" },  // 1 query of category "learning"
    { "query": "...", "category": "interview" }  // 1 query of category "interview"
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

  if (geminiClient && !process.env.SIMULATE_GEMINI_FAILURE) {
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

  // 3. Groq fallback (if all Gemini models failed)
  if (!resultString) {
    try {
      if (!groqClient) throw new Error('Groq client not initialized');

      logger.info('AI_FALLBACK_ATTEMPT', { provider: 'Groq' });
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      resultString = completion.choices[0]?.message?.content || '';
      if (resultString) {
        logger.info('AI_FALLBACK_SUCCESS', { provider: 'Groq' });
      }
    } catch (groqError: any) {
      logger.error('GROQ_FAILURE_FATAL', { error: groqError.message });
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
    aiCache.set(hash, JSON.stringify(validatedData));

    return validatedData;
  } catch (parseError: any) {
    logger.error('AI_RESPONSE_PARSE_ERROR', {
      rawResponse: resultString.substring(0, 500),
      error: parseError.message,
    });
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to parse AI analysis response.');
  }
}
