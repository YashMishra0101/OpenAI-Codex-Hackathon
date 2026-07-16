import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnalyzerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
          Analyzing Your Resume...
        </h2>
        <p className="text-muted-foreground">This usually takes about 5 to 10 seconds. Our AI is parsing your PDF, matching it against the job description, and preparing feedback.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Overall Verdict</CardTitle>
          <Skeleton className="h-6 w-24 rounded-full" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" /> Strengths
              </h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" /> Areas for Improvement
              </h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Advanced Search Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
