import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { ApiError } from '../utils/ApiError.js';
import { HTTP } from '../constants/httpStatus.js';
import { analyzeResume } from './aiService.js';
import logger from '../utils/logger.js';
import { Resume } from '../models/Resume.js';

interface AnalyzeResumeInput {
  userId: string;
  pdfPath: string;
  jobDescription?: string;
  searchPreferences?: string;
}

export async function processAndAnalyzeResume(input: AnalyzeResumeInput) {
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
    } catch (cleanupErr: any) {
      logger.error('FILE_CLEANUP_ERROR', { error: cleanupErr.message, pdfPath });
    }
  }

  // Reject extremely small PDFs which likely failed to parse or are just images
  if (resumeText.trim().length < 50) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Extracted text is too short. Please upload a valid text-based PDF resume.');
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
