import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AnalyzerForm } from '@/features/analyzer/components/AnalyzerForm';
import { AnalyzerSkeleton } from '@/features/analyzer/components/AnalyzerSkeleton';
import { AnalysisResult } from '@/features/analyzer/components/AnalysisResult';
import { useAnalyzeResume } from '@/features/analyzer/api/analyzerApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export function AnalyzerPage() {
  const analyzeMutation = useAnalyzeResume();
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleSubmit = (data: { resume: File; jobDescription?: string; searchPreferences?: string }) => {
    analyzeMutation.mutate(data, {
      onSuccess: (response) => {
        setAnalysisData(response.data);
        toast.success('Resume analyzed successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to analyze resume. Please try again.';
        toast.error(message);
      },
    });
  };

  const handleReset = () => {
    setAnalysisData(null);
    analyzeMutation.reset();
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analysisData ? (
          <div className="space-y-6">
            {/* Back / Reset bar */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Analyze Another Resume
              </Button>
            </div>
            <AnalysisResult data={analysisData} />
          </div>
        ) : analyzeMutation.isPending ? (
          <AnalyzerSkeleton />
        ) : (
          <AnalyzerForm onSubmit={handleSubmit} isLoading={analyzeMutation.isPending} />
        )}
      </div>
    </div>
  );
}
