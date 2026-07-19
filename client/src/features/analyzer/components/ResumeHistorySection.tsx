import { useResumeHistory } from '@/features/analyzer/api/analyzerHistoryApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

export function ResumeHistorySection() {
  const { data: history, isLoading, error } = useResumeHistory();

  return (
    <div className="rounded-xl border border-border/50 bg-surface/40 mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground flex items-center">
          Recent Analyses
          {history && history.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border/50">
              {history.length}
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold tracking-tight mb-1">
              No previous analyses
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Upload your resume above to get started. Your past results will appear here.
            </p>
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
                  className="group hover:border-primary/30 transition-all flex flex-col border-border/40 hover:shadow-md bg-background/50 backdrop-blur-sm"
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
                          {resume.verdict}
                        </Badge>
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded-md ring-1 ring-border/50">
                        <Calendar className="h-3 w-3 opacity-70" />
                        {new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Analysis type */}
                    <h3 className="text-sm font-semibold mb-1.5">
                      {resume.jobDescription ? 'Targeted Analysis' : 'General Analysis'}
                    </h3>

                    {/* Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                      {resume.analysis?.strengths?.[0] || 'No preview available.'}
                    </p>

                    {/* Stat row */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                        {resume.analysis?.strengths?.length || 0} strengths
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                        {resume.analysis?.improvements?.length || 0} improvements
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      to={`/analyzer/${resume._id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover mt-4 group-hover:underline transition-colors w-fit"
                    >
                      View Analysis
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
  );
}
