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
      {/* ── Score / Verdict Hero ── */}
      <Card className={`${verdict.border} overflow-hidden`}>
        <CardContent className="py-10 sm:py-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${verdict.bg} flex items-center justify-center`}>
              <VerdictIcon className={`h-8 w-8 ${verdict.color}`} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis Complete</h2>
              <Badge variant={verdict.badgeVariant} className="text-sm px-4 py-1.5">
                {verdict.label}
              </Badge>
            </div>
            <p className="text-sm text-foreground/70 max-w-xl leading-relaxed">
              {verdict.description}
            </p>
            {/* ── Completion Status Indicators ── */}
            <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
              {/* Feedback */}
              {data.analysis &&
                (data.analysis.strengths?.length > 0 ||
                  data.analysis.improvements?.length > 0) && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    <span className="text-xs font-medium text-success tracking-wide">
                      Resume Feedback Generated
                    </span>
                  </div>
                )}

              {/* Interview Questions */}
              {data.interviewQuestions && data.interviewQuestions.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <span className="text-xs font-medium text-success tracking-wide">
                    Interview Questions Generated
                  </span>
                </div>
              )}

              {/* Search Queries */}
              {data.searchQueries && data.searchQueries.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <span className="text-xs font-medium text-success tracking-wide">
                    Google Dork Queries Generated
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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
