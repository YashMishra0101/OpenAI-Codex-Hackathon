import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AnalyzerForm } from '@/features/analyzer/components/AnalyzerForm';
import { AnalyzerSkeleton } from '@/features/analyzer/components/AnalyzerSkeleton';
import { AnalysisResult } from '@/features/analyzer/components/AnalysisResult';
import { useAnalyzeResume } from '@/features/analyzer/api/analyzerApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div className="container max-w-6xl py-10 px-4 md:px-6">
      {analysisData ? (
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleReset} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Analyze Another Resume
          </Button>
          <AnalysisResult data={analysisData} />
        </div>
      ) : analyzeMutation.isPending ? (
        <AnalyzerSkeleton />
      ) : (
        <AnalyzerForm onSubmit={handleSubmit} isLoading={analyzeMutation.isPending} />
      )}
    </div>
  );
}
