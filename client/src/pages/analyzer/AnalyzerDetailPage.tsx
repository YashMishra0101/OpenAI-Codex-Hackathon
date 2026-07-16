import { useParams, Link } from 'react-router-dom';
import { useResumeById } from '@/features/analyzer/api/analyzerHistoryApi';
import { AnalysisResult } from '@/features/analyzer/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AnalyzerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: analysisData, isLoading, error } = useResumeById(id);

  if (isLoading) {
    return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
  }

  if (error || !analysisData) {
    return (
      <div className="container max-w-5xl py-10 text-center">
        <p className="text-destructive mb-4">Failed to load analysis details or it does not exist.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/resume-checker">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10 px-4 md:px-6">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/dashboard/resume-checker">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
        </Link>
      </Button>
      
      <div className="mb-8 p-4 bg-muted/20 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Original Request details</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Date Analyzed:</strong> {new Date(analysisData.createdAt).toLocaleString()}</p>
          {analysisData.jobDescription && (
            <p className="line-clamp-2"><strong>Target Job:</strong> {analysisData.jobDescription}</p>
          )}
          {analysisData.searchPreferences && (
            <p><strong>Preferences:</strong> {analysisData.searchPreferences}</p>
          )}
        </div>
      </div>

      <AnalysisResult data={analysisData} />
    </div>
  );
}
