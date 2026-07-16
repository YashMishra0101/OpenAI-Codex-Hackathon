import { z } from 'zod';

// We treat AI output as entirely untrusted. This schema ensures the JSON
// perfectly matches our application's data contract before we save it or return it.
export const aiResponseSchema = z.object({
  overallVerdict: z.enum(['Strong', 'Partial', 'Weak']),
  analysis: z.object({
    strengths: z.array(z.string()).min(1, 'Must provide at least one strength'),
    improvements: z.array(z.string()).min(1, 'Must provide at least one improvement'),
  }),
  interviewQuestions: z
    .array(z.string())
    .min(10, 'Must provide at least 10 interview questions')
    .max(50, 'Must provide at most 50 interview questions'),
  searchQueries: z
    .array(
      z.object({
        query: z.string(),
        category: z.enum(['job', 'learning', 'interview']),
      })
    )
    .min(10, 'Must provide exactly 10 search queries')
    .max(10, 'Must provide exactly 10 search queries')
    .refine(
      (queries) => {
        const jobCount = queries.filter((q) => q.category === 'job').length;
        const learningCount = queries.filter((q) => q.category === 'learning').length;
        const interviewCount = queries.filter((q) => q.category === 'interview').length;
        
        return jobCount === 8 && learningCount === 1 && interviewCount === 1;
      },
      {
        message: 'Search queries must be exactly 8 job, 1 learning, and 1 interview category.',
      }
    ),
});

export type AIResponseDto = z.infer<typeof aiResponseSchema>;
