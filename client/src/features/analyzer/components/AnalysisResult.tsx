import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
} from 'lucide-react';
import { InterviewQuestions } from './InterviewQuestions';
import { SearchQueries } from './SearchQueries';
import { AnalyzeResumeResponse } from '../api/analyzerApi';

interface AnalysisResultProps {
  data: AnalyzeResumeResponse['data'];
}

/* ─── Verdict Configuration ─────────────────────────────────────────────────── */

const VERDICT_CONFIG = {
  Strong: {
    icon: ShieldCheck,
    label: 'Strong Match',
    badgeVariant: 'success' as const,
    color: 'text-success',
    bg: 'bg-success-subtle',
    border: 'border-success/20',
    description:
      'Your resume aligns well with the requirements. Focus on the improvements below to make it even stronger.',
  },
  Partial: {
    icon: ShieldAlert,
    label: 'Partial Match',
    badgeVariant: 'warning' as const,
    color: 'text-warning',
    bg: 'bg-warning-subtle',
    border: 'border-warning/20',
    description:
      'Your resume covers some key areas but has notable gaps. Review the suggestions below to strengthen your application.',
  },
  Weak: {
    icon: ShieldX,
    label: 'Weak Match',
    badgeVariant: 'destructive' as const,
    color: 'text-error',
    bg: 'bg-error-subtle',
    border: 'border-error/20',
    description:
      'Significant improvements are needed. Follow the recommendations below to better align your resume with the role.',
  },
};

/* ─── Main Component ────────────────────────────────────────────────────────── */

export function AnalysisResult({ data: initialData }: AnalysisResultProps) {
  const [data] = useState(initialData);
  const verdict = VERDICT_CONFIG[data.verdict] || VERDICT_CONFIG.Partial;
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Dashboard Header (Evaluation Card) ── */}
      <div className="flex flex-col mb-8 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm p-6 sm:p-8 pb-4 sm:pb-5">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                AI Evaluation
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Resume successfully analyzed.
            </p>
          </div>

          {/* Generated Artifacts Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {data.analysis && (data.analysis.strengths?.length > 0 || data.analysis.improvements?.length > 0) && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-3 py-1 text-xs font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Feedback
              </div>
            )}
            {data.interviewQuestions && data.interviewQuestions.length > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-3 py-1 text-xs font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Questions
              </div>
            )}
            {data.searchQueries && data.searchQueries.length > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-3 py-1 text-xs font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Dorks
              </div>
            )}
          </div>
        </div>

        {/* Center Verdict Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${verdict.bg} mb-5`}>
            <VerdictIcon className={`w-8 h-8 ${verdict.color}`} />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${verdict.color}`}>
            {verdict.label}
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {verdict.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-[18px] w-[18px] text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          AI-Generated Insights
        </h3>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      {/* ── Strengths & Improvements ── */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Strengths Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-success-subtle flex items-center justify-center">
                <CheckCircle2 className="h-[18px] w-[18px] text-success" />
              </div>
              Key Strengths
              <Badge variant="success" className="ml-auto text-xs px-2.5 py-0.5">
                {data.analysis.strengths.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.analysis.strengths.map((strength: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg bg-success-subtle/50 border border-success/10 text-sm"
              >
                <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                </span>
                <span className="text-foreground leading-relaxed">{strength}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Improvements Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-warning-subtle flex items-center justify-center">
                <AlertTriangle className="h-[18px] w-[18px] text-warning" />
              </div>
              Areas for Improvement
              <Badge variant="warning" className="ml-auto text-xs px-2.5 py-0.5">
                {data.analysis.improvements.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.analysis.improvements.map((improvement: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg bg-warning-subtle/50 border border-warning/10 text-sm"
              >
                <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-warning/15 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                </span>
                <span className="text-foreground leading-relaxed">{improvement}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── AI-Generated Insights ── */}
      <div className="space-y-8">
        {/* Interview Questions — Full Width */}
        <InterviewQuestions
          resumeId={data._id}
          initialQuestions={data.interviewQuestions}
          initialCount={data.questionGenerationCount || 1}
        />

        {/* Search Queries — Full Width */}
        <SearchQueries queries={data.searchQueries} />
      </div>
    </div>
  );
}
