import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { analyzeResume } from './aiService.js';
import logger from '../utils/logger.js';
import { Resume } from '../models/Resume.js';

// Maximum characters of resume text sent to the AI and stored in MongoDB.
// A typical 2-page resume is ~3,000–5,000 chars. 15,000 chars covers even the
// longest legitimate resumes while preventing BSON overflow and AI token burn.
const MAX_RESUME_TEXT_CHARS = 15_000;

interface AnalyzeResumeInput {
  userId: string;
  pdfPath: string;
  jobDescription?: string;
  searchPreferences?: string;
}

export async function processAndAnalyzeResume(input: AnalyzeResumeInput): Promise<unknown> {
  const { userId, pdfPath, jobDescription, searchPreferences } = input;
  
  let resumeText = '';
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    resumeText = data.text;
  } catch (err: any) {
    logger.error('PDF_PARSE_ERROR', { error: err.message, userId });
    throw new ApiError(HTTP.BAD_REQUEST, 'Failed to extract text from PDF. Ensure the file is not password protected and contains readable text.');
  } finally {
    // Always clean up the temporary PDF file to prevent OOM / disk leaks
    try {
      await fs.unlink(pdfPath);
    } catch (cleanupErr: unknown) {
      logger.error('FILE_CLEANUP_ERROR', { error: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr), pdfPath });
    }
  }

  // Reject extremely small PDFs which likely failed to parse or are just images
  if (resumeText.trim().length < 50) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Extracted text is too short. Please upload a valid text-based PDF resume.');
  }

  // Truncate oversized text to prevent BSON limit violations, AI token overrun,
  // and prompt injection through excessively long resume content.
  if (resumeText.length > MAX_RESUME_TEXT_CHARS) {
    logger.warn('RESUME_TEXT_TRUNCATED', {
      userId,
      originalLength: resumeText.length,
      truncatedTo: MAX_RESUME_TEXT_CHARS,
    });
    resumeText = resumeText.slice(0, MAX_RESUME_TEXT_CHARS);
  }

  const analysisResult = await analyzeResume({
    resumeText,
    jobDescription,
    searchPreferences,
  });

  // Save the result to DB
  const resume = await Resume.create({
    user: userId,
    resumeText,
    jobDescription,
    searchPreferences,
    verdict: analysisResult.overallVerdict,
    analysis: analysisResult.analysis,
    interviewQuestions: analysisResult.interviewQuestions,
    searchQueries: analysisResult.searchQueries,
  });

  return resume;
}
