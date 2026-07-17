import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegenerateQuestions } from '../api/analyzerApi';
import toast from 'react-hot-toast';

interface InterviewQuestionsProps {
  resumeId: string;
  initialQuestions: string[];
  initialCount: number;
}

export function InterviewQuestions({ resumeId, initialQuestions, initialCount }: InterviewQuestionsProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [visibleCount, setVisibleCount] = useState(10);
  const [numToGenerate, setNumToGenerate] = useState(30);
  const [generationCount, setGenerationCount] = useState(initialCount);

  const { mutate: regenerate, isPending } = useRegenerateQuestions();

  const handleRegenerate = () => {
    if (generationCount >= 5) {
      toast.error('Maximum generation limit (5/5) reached. Please upload a new resume.');
      return;
    }

    regenerate(
      { resumeId, numQuestions: numToGenerate },
      {
        onSuccess: (response) => {
          setQuestions(response.data.interviewQuestions);
          setGenerationCount(response.data.questionGenerationCount);
          setVisibleCount(10);
          toast.success('Interview questions regenerated successfully!');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to regenerate questions');
        },
      }
    );
  };

  const displayQuestions = questions.slice(0, visibleCount);
  const maxReached = generationCount >= 5;

  return (
    <Card className="shadow-sm flex flex-col">
      <CardHeader className="border-b pb-4 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" /> Most Frequently Asked Interview Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">
          These questions are personalized based on your uploaded resume and the provided job description.
        </p>

        <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="num-questions" className="text-sm font-medium">
                Number of questions: <span className="font-bold text-primary">{numToGenerate}</span>
              </label>
              <input
                id="num-questions"
                type="range"
                min="10"
                max="50"
                step="5"
                value={numToGenerate}
                onChange={(e) => setNumToGenerate(Number(e.target.value))}
                className="w-full accent-primary"
                disabled={isPending || maxReached}
              />
            </div>
            <div className="flex flex-col gap-1 sm:text-right shrink-0">
              <Button
                onClick={handleRegenerate}
                disabled={isPending || maxReached}
                size="sm"
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
              <span className={`text-xs ${maxReached ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {generationCount}/5 uses
              </span>
            </div>
          </div>
          {maxReached && (
            <p className="text-xs text-destructive mt-3 bg-destructive/10 p-2 rounded">
              You have reached the limit of 5 generations for this resume. Upload a new resume to generate more.
            </p>
          )}
        </div>
        
        <ul className="space-y-4 mb-6">
          {displayQuestions.map((q, idx) => (
            <li key={idx} className="bg-muted/30 p-4 rounded-lg text-sm flex gap-3 border border-border">
              <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>

        {visibleCount < questions.length && (
          <div className="mt-auto text-center pt-2">
            <Button variant="outline" onClick={() => setVisibleCount((prev) => Math.min(prev + 10, questions.length))}>
              Show More Questions ({questions.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
