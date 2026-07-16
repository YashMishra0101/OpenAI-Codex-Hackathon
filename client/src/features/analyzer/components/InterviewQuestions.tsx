import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewQuestionsProps {
  questions: string[];
}

export function InterviewQuestions({ questions }: InterviewQuestionsProps) {
  const [visibleCount, setVisibleCount] = useState(10);

  const displayQuestions = questions.slice(0, visibleCount);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b pb-4 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" /> Interview Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          The AI has generated tailored interview questions based on your resume and job description.
        </p>
        
        <ul className="space-y-4">
          {displayQuestions.map((q, idx) => (
            <li key={idx} className="bg-muted/30 p-4 rounded-lg text-sm flex gap-3 border border-border">
              <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>

        {visibleCount < questions.length && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setVisibleCount((prev) => Math.min(prev + 10, questions.length))}>
              Show More Questions ({questions.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
