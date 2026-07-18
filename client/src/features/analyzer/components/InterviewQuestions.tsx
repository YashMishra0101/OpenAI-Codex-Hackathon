import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, RefreshCw, ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRegenerateQuestions } from '../api/analyzerApi';
import toast from 'react-hot-toast';

interface InterviewQuestionsProps {
  resumeId: string;
  initialQuestions: string[];
  initialCount: number;
}

export function InterviewQuestions({
  resumeId,
  initialQuestions,
  initialCount,
}: InterviewQuestionsProps) {
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
      },
    );
  };

  const displayQuestions = questions.slice(0, visibleCount);
  const maxReached = generationCount >= 5;
  const remaining = questions.length - visibleCount;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-[18px] w-[18px] text-primary" />
            </div>
            Interview Questions
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-normal">
              {questions.length} total
            </Badge>
          </CardTitle>

          {/* Regenerate Controls */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="num-questions"
                  className="text-sm text-muted-foreground whitespace-nowrap"
                >
                  Generate:
                </label>
                <select
                  id="num-questions"
                  value={numToGenerate}
                  onChange={(e) => setNumToGenerate(Number(e.target.value))}
                  disabled={isPending || maxReached}
                  className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {[10, 15, 20, 25, 30, 35, 40, 45, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleRegenerate}
                disabled={isPending || maxReached}
                size="sm"
                variant="outline"
                className="h-8 text-xs"
              >
                {isPending ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Regenerate
              </Button>
              <Badge
                variant={maxReached ? 'destructive' : 'outline'}
                className="text-[10px] px-2 py-0.5 shrink-0"
              >
                {generationCount}/5
              </Badge>
            </div>
            <p className="text-[11.5px] text-muted-foreground pl-2 mt-1.5">
              {maxReached
                ? 'Limit reached — upload a new resume to regenerate'
                : `Default: 30 · Range: 10–50 · ${5 - generationCount} generation${5 - generationCount === 1 ? '' : 's'} remaining`}
            </p>
          </div>
        </div>

        {maxReached && (
          <p className="text-sm text-error bg-error-subtle p-3 rounded-lg mt-3 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-error shrink-0" />
            Maximum generation limit reached. Upload a new resume to generate more questions.
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-5">
          These questions are personalized based on your resume and the provided job description.
        </p>

        {/* Question List */}
        <div className="space-y-2.5">
          {displayQuestions.map((q, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-3 p-4 rounded-lg border border-border/40 bg-surface/40 hover:border-border hover:bg-surface-raised/50 transition-colors"
            >
              <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{q}</p>
              </div>
              <MessageCircleQuestion className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5 group-hover:text-primary/40 transition-colors" />
            </div>
          ))}
        </div>

        {/* Show More */}
        {remaining > 0 && (
          <div className="pt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 10, questions.length))}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
              Show more ({remaining} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
