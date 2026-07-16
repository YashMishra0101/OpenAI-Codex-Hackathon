import crypto from 'crypto';
import { geminiClient } from '../config/gemini.js';
import { groqClient } from '../config/groq.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { aiResponseSchema } from '../validations/resumeValidation.js';

// Simple in-memory cache to prevent redundant LLM calls
// In production, this would be Redis, but for the hackathon MVP, Map is sufficient.
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
  
  let prompt = `You are a strict, senior technical recruiter and career coach.
Analyze the following resume`;

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
  "searchQueries": [ // Generate exactly 10 advanced Google search queries (e.g. site:lever.co OR site:greenhouse.io "software engineer")
    { "query": "...", "category": "job" }, // 8 queries of category "job"
    { "query": "...", "category": "learning" }, // 1 query of category "learning"
    { "query": "...", "category": "interview" } // 1 query of category "interview"
  ]
}
`;

  return prompt;
}

export async function analyzeResume(params: AIAnalysisParams): Promise<any> {
  const prompt = buildPrompt(params);

  // 1. Generate SHA-256 hash for cache key
  const hash = crypto.createHash('sha256').update(prompt).digest('hex');
  
  if (aiCache.has(hash)) {
    logger.info('AI_CACHE_HIT', { hash });
    return JSON.parse(aiCache.get(hash)!);
  }

  let resultString = '';

  // 2. Try Primary Model: Gemini 3.5 Flash
  try {
    if (!geminiClient) throw new Error('Gemini client not initialized');
    
    logger.info('AI_PRIMARY_ATTEMPT', { provider: 'Gemini' });
    const response = await geminiClient.models.generateContent({
      model: 'gemini-1.5-flash', // Google GenAI SDK model name
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    resultString = response.text || '';
    
  } catch (geminiError: any) {
    logger.error('GEMINI_FAILURE_FALLING_BACK', { error: geminiError.message });
    
    // 3. Try Secondary Model: Groq Qwen (Fallback)
    try {
      if (!groqClient) throw new Error('Groq client not initialized');
      
      logger.info('AI_FALLBACK_ATTEMPT', { provider: 'Groq' });
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'qwen-2.5-32b', // Accessible Groq model
        response_format: { type: 'json_object' },
      });

      resultString = completion.choices[0]?.message?.content || '';
    } catch (groqError: any) {
      logger.error('GROQ_FAILURE_FATAL', { error: groqError.message });
      throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'AI Providers are currently unavailable.');
    }
  }

  // 4. Clean and parse output
  try {
    // Sometimes models return ```json ... ``` despite instructions. Strip it.
    let cleaned = resultString.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    
    const parsedData = JSON.parse(cleaned);
    
    // Validate against strict Zod schema (strips unknown properties and ensures correct counts/types)
    const validatedData = aiResponseSchema.parse(parsedData);
    
    // 5. Save to Cache
    aiCache.set(hash, JSON.stringify(validatedData));
    
    return validatedData;
  } catch (parseError: any) {
    logger.error('AI_RESPONSE_PARSE_ERROR', { rawResponse: resultString, error: parseError.message });
    throw new ApiError(HTTP.INTERNAL_SERVER_ERROR, 'Failed to parse AI analysis response.');
  }
}
