import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, BrainCircuit, CheckCircle2, Sparkles, FileSearch } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const analyzerFormSchema = z.object({
  jobDescription: z.string().optional(),
  searchPreferences: z.string().optional(),
});

type AnalyzerFormValues = z.infer<typeof analyzerFormSchema>;

interface AnalyzerFormProps {
  onSubmit: (data: { resume: File; jobDescription?: string; searchPreferences?: string }) => void;
  isLoading: boolean;
}

/* ─── Step Indicator ────────────────────────────────────────────────────────── */

const STEPS = [
  { label: 'Upload', icon: UploadCloud },
  { label: 'Analyze', icon: BrainCircuit },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        return (
          <div key={step.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px transition-colors duration-300 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Form ─────────────────────────────────────────────────────────────── */

export function AnalyzerForm({ onSubmit, isLoading }: AnalyzerFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<AnalyzerFormValues>({
    resolver: zodResolver(analyzerFormSchema),
    defaultValues: {
      jobDescription: '',
      searchPreferences: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFileError(null);
    if (rejectedFiles.length > 0) {
      setFileError('Please upload a valid PDF file under 10MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  });

  const handleSubmit = (values: AnalyzerFormValues) => {
    if (!resumeFile) {
      setFileError('A PDF resume is required.');
      return;
    }
    onSubmit({
      resume: resumeFile,
      jobDescription: values.jobDescription,
      searchPreferences: values.searchPreferences,
    });
  };

  // Determine current step based on form state
  const currentStep = resumeFile ? 1 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Hero Header ── */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Resume Analyzer</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Upload your resume and get instant AI-powered feedback, personalized interview questions, and advanced job search queries.
          </p>
        </div>
        <StepIndicator currentStep={currentStep} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* ── File Upload Zone ── */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">
              Resume PDF <span className="text-error">*</span>
            </FormLabel>
            <div
              {...getRootProps()}
              className={`group relative border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : resumeFile
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
              } ${fileError ? 'border-error bg-error-subtle' : ''}`}
            >
              <input {...getInputProps()} />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-error hover:border-error/50 hover:bg-error-subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                    <UploadCloud className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5">PDF format · Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
            {fileError && (
              <p className="text-sm font-medium text-error flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-error" />
                {fileError}
              </p>
            )}
          </div>

          {/* ── Optional Fields ── */}
          <Card className="border-border/50 bg-surface/40">
            <CardContent className="pt-7 pb-7 space-y-6">
              <div className="flex items-center gap-2.5 mb-1">
                <FileSearch className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="text-base font-medium text-foreground/70">Optional — Customize your analysis</span>
              </div>

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Target Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste a job description here to get a targeted match analysis…"
                        className="min-h-[130px] resize-y text-sm"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[13px] text-muted-foreground">
                      Adding a job description helps the AI compare your resume against specific requirements.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="searchPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Search Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., Remote roles, Senior positions in Fintech, Bay Area startups…"
                        className="min-h-[100px] resize-y text-sm"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[13px] text-muted-foreground">
                      Helps generate more relevant Google Dork search queries for your job hunt.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ── Submit ── */}
          <Button
            type="submit"
            className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            disabled={isLoading || !resumeFile}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="xs" className="mr-2 border-primary-foreground border-t-transparent" />
                Analyzing Resume…
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
