import { useResumeHistory } from '@/features/analyzer/api/analyzerHistoryApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AnalyzerHistoryPage() {
  const { data: history, isLoading, error } = useResumeHistory();

  if (isLoading) {
    return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="container max-w-5xl py-10">
        <p className="text-destructive text-center">Failed to load history.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-muted-foreground mt-2">View your past resume analyses and tracked metrics.</p>
        </div>
        <Link to="/analyzer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          New Analysis
        </Link>
      </div>

      {!history || history.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No analyses found</h3>
          <p className="text-muted-foreground mt-1 mb-4">You haven't analyzed any resumes yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {history.map((resume) => (
            <Card key={resume._id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant={resume.verdict === 'Strong' ? 'success' : resume.verdict === 'Partial' ? 'warning' : 'destructive'}>
                    {resume.verdict} Match
                  </Badge>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1">
                  {resume.jobDescription ? 'Targeted Analysis' : 'General Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <p className="line-clamp-2">{resume.analysis.strengths[0]}</p>
                </div>
                <Link to={`/analyzer/${resume._id}`} className="text-primary font-medium flex items-center gap-1 hover:underline mt-auto">
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
