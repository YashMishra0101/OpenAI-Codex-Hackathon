import { useParams, Link } from 'react-router-dom';
import { useResumeById } from '@/features/analyzer/api/analyzerHistoryApi';
import { AnalysisResult } from '@/features/analyzer/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Briefcase, Settings2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AnalyzerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: analysisData, isLoading, error } = useResumeById(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading analysis…</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-subtle mb-5">
              <FileText className="h-6 w-6 text-error" />
            </div>
            <h3 className="text-base font-semibold tracking-tight mb-2">
              Analysis Not Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              This analysis may have been deleted or does not exist. Please check your history.
            </p>
            <Button asChild variant="outline">
              <Link to="/dashboard/resume-checker">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Navigation ── */}
        <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/dashboard/resume-checker">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to History
          </Link>
        </Button>

        {/* ── Metadata Card ── */}
        <Card className="border-border/50 mb-6">
          <CardContent className="py-4 px-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">
                    {analysisData.jobDescription ? 'Targeted Analysis' : 'General Analysis'}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(analysisData.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                {analysisData.jobDescription && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-normal gap-1">
                    <Briefcase className="h-3 w-3" />
                    Job targeted
                  </Badge>
                )}
                {analysisData.searchPreferences && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-normal gap-1">
                    <Settings2 className="h-3 w-3" />
                    Custom preferences
                  </Badge>
                )}
              </div>
            </div>

            {/* Expandable details */}
            {(analysisData.jobDescription || analysisData.searchPreferences) && (
              <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                {analysisData.jobDescription && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Target Job Description
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                      {analysisData.jobDescription}
                    </p>
                  </div>
                )}
                {analysisData.searchPreferences && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Search Preferences
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {analysisData.searchPreferences}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Results ── */}
        <AnalysisResult data={analysisData} />
      </div>
    </div>
  );
}
