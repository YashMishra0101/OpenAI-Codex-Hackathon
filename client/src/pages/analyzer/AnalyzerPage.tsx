import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AnalyzerForm } from '@/features/analyzer/components/AnalyzerForm';
import { AnalyzerSkeleton } from '@/features/analyzer/components/AnalyzerSkeleton';
import { AnalysisResult } from '@/features/analyzer/components/AnalysisResult';
import { useAnalyzeResume, AnalyzeResumeResponse } from '@/features/analyzer/api/analyzerApi';
import { Button } from '@/components/ui/button';
import { Trash2, UploadCloud } from 'lucide-react';

const STORAGE_KEY = 'analyzer_result_v1';

function loadPersistedResult(): AnalyzeResumeResponse['data'] | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistResult(data: AnalyzeResumeResponse['data']): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (private browsing edge cases) — fail silently
  }
}

function clearPersistedResult(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AnalyzerPage() {
  const analyzeMutation = useAnalyzeResume();
  const [analysisData, setAnalysisData] = useState<AnalyzeResumeResponse['data'] | null>(
    () => loadPersistedResult()
  );

  // Keep sessionStorage in sync whenever analysisData changes
  useEffect(() => {
    if (analysisData) {
      persistResult(analysisData);
    }
  }, [analysisData]);

  const handleSubmit = (data: { resume: File; jobDescription?: string; searchPreferences?: string }) => {
    analyzeMutation.mutate(data, {
      onSuccess: (response) => {
        // Uploading a new resume always clears the previous result
        clearPersistedResult();
        setAnalysisData(response.data);
        toast.success('Resume analyzed successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to analyze resume. Please try again.';
        toast.error(message);
      },
    });
  };

  const handleClear = () => {
    clearPersistedResult();
    setAnalysisData(null);
    analyzeMutation.reset();
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analysisData ? (
          <div className="space-y-6">
            {/* ── Action Bar ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Analyze Another Resume
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Analysis
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
