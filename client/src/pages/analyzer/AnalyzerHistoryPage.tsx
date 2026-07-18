import { useResumeHistory } from '@/features/analyzer/api/analyzerHistoryApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  ArrowRight,
  Plus,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/* ─── Verdict helpers ───────────────────────────────────────────────────────── */

const VERDICT_META = {
  Strong: {
    icon: ShieldCheck,
    color: 'text-success',
    bg: 'bg-success-subtle',
  },
  Partial: {
    icon: ShieldAlert,
    color: 'text-warning',
    bg: 'bg-warning-subtle',
  },
  Weak: {
    icon: ShieldX,
    color: 'text-error',
    bg: 'bg-error-subtle',
  },
} as const;

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function AnalyzerHistoryPage() {
  const { data: history, isLoading, error } = useResumeHistory();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page Header — matches Job Tracker ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Checker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your past AI resume analyses and insights.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto shrink-0">
            <Link to="/analyzer">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* ── Content Panel — matches Job Tracker ── */}
        <div className="rounded-xl border border-border/50 bg-surface/40">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">
              Analysis History
              {history && history.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {history.length} {history.length === 1 ? 'analysis' : 'analyses'}
                </span>
              )}
            </h2>
          </div>

          {/* Panel content */}
          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-error font-medium">Failed to load analysis history.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please refresh the page to try again.
                  </p>
                </div>
              </div>
            ) : !history || history.length === 0 ? (
              /* Empty state — matches Job Tracker */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-2">
                  No analyses yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                  Upload your resume to get AI-powered feedback, personalized interview questions, and advanced job search queries.
                </p>
                <Button asChild>
                  <Link to="/analyzer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Your First Resume
                  </Link>
                </Button>
              </div>
            ) : (
              /* History Grid */
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((resume) => {
                  const verdictMeta =
                    VERDICT_META[resume.verdict as keyof typeof VERDICT_META] || VERDICT_META.Partial;
                  const VerdictIcon = verdictMeta.icon;

                  return (
                    <Card
                      key={resume._id}
                      className="group hover:border-primary/30 transition-colors flex flex-col border-border/40"
                    >
                      <CardContent className="pt-5 pb-4 px-5 flex-1 flex flex-col">
                        {/* Top row: verdict + date */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${verdictMeta.bg} flex items-center justify-center`}>
                              <VerdictIcon className={`h-3.5 w-3.5 ${verdictMeta.color}`} />
                            </div>
                            <Badge
                              variant={
                                resume.verdict === 'Strong'
                                  ? 'success'
                                  : resume.verdict === 'Partial'
                                    ? 'warning'
                                    : 'destructive'
                              }
                              className="text-[10px] px-2 py-0"
                            >
                              {resume.verdict} Match
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Analysis type */}
                        <h3 className="text-sm font-semibold mb-1.5">
                          {resume.jobDescription ? 'Targeted Analysis' : 'General Analysis'}
                        </h3>

                        {/* Preview */}
                        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                          {resume.analysis.strengths[0]}
                        </p>

                        {/* Stat row */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30 text-[11px] text-muted-foreground">
                          <span>{resume.analysis.strengths.length} strengths</span>
                          <span className="h-3 w-px bg-border" />
                          <span>{resume.analysis.improvements.length} improvements</span>
                        </div>

                        {/* CTA */}
                        <Link
                          to={`/analyzer/${resume._id}`}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover mt-3 group-hover:underline transition-colors"
                        >
                          View Full Analysis
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
