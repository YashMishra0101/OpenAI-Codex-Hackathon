import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

/* ─── Rotating status messages to indicate AI activity ──────────────────────── */
const STATUS_MESSAGES = [
  'Parsing your PDF document…',
  'Extracting key skills and experience…',
  'Analyzing strengths and qualifications…',
  'Identifying areas for improvement…',
  'Generating interview questions…',
  'Crafting advanced search queries…',
  'Finalizing your personalized report…',
];

const STEPS = [
  { label: 'Parsing', detail: 'Reading your resume' },
  { label: 'Analyzing', detail: 'AI evaluation' },
  { label: 'Generating', detail: 'Building your report' },
];

export function AnalyzerSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* ── AI Processing Hero ── */}
      <div className="text-center space-y-6">
        {/* Animated AI icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BrainCircuit className="h-9 w-9 text-primary animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analyzing Your Resume
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-5xl mx-auto">
            Our AI is reviewing your resume and preparing personalized insights. This typically takes 5–10 seconds.
          </p>
        </div>

        {/* Rotating status message */}
        <div className="h-6 flex items-center justify-center">
          <p
            key={messageIndex}
            className="text-sm text-primary font-medium animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {STATUS_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    idx < activeStep
                      ? 'bg-primary text-primary-foreground'
                      : idx === activeStep
                        ? 'bg-primary/15 text-primary border border-primary/30 animate-pulse'
                        : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {idx < activeStep ? '✓' : idx + 1}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${idx <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">{step.detail}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-px transition-colors duration-500 -mt-5 ${
                    idx < activeStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Skeleton Cards Preview ── */}
      <div className="space-y-6 opacity-40">
        {/* Verdict skeleton */}
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Strengths + Improvements skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-11/12 rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-10/12 rounded-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Interview + Search skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
