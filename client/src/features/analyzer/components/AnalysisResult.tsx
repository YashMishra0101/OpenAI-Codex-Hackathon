import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { InterviewQuestions } from './InterviewQuestions';
import { SearchQueries } from './SearchQueries';
import { AnalyzeResumeResponse } from '../api/analyzerApi';

interface AnalysisResultProps {
  data: AnalyzeResumeResponse['data'];
}

export function AnalysisResult({ data: initialData }: AnalysisResultProps) {
  const [data, setData] = useState(initialData);
  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Strong':
        return <Badge variant="success" className="text-sm px-3 py-1">Strong Match</Badge>;
      case 'Partial':
        return <Badge variant="warning" className="text-sm px-3 py-1">Partial Match</Badge>;
      case 'Weak':
        return <Badge variant="destructive" className="text-sm px-3 py-1">Weak Match</Badge>;
      default:
        return <Badge variant="secondary">{verdict}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Analysis Complete</h2>
        <p className="text-muted-foreground mt-2">Here is what the AI thought about your resume.</p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/20">
          <CardTitle className="text-xl">Overall Verdict</CardTitle>
          {getVerdictBadge(data.verdict)}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-5 w-5" /> Key Strengths
              </h3>
              <ul className="space-y-3">
                {data.analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="min-w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="h-5 w-5" /> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {data.analysis.improvements.map((improvement: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="min-w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Interactive Phase 11 Components */}
      <div className="grid md:grid-cols-2 gap-6">
        <InterviewQuestions 
          resumeId={data._id}
          initialQuestions={data.interviewQuestions}
          initialCount={data.questionGenerationCount || 1}
        />
        <SearchQueries queries={data.searchQueries} />
      </div>
    </div>
  );
}
