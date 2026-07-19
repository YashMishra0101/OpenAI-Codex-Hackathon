import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, BrainCircuit, CheckCircle2, Sparkles, FileSearch, Info, Wifi, FileWarning, ScanText, HardDrive, RefreshCw } from 'lucide-react';
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
  const [showAllNotes, setShowAllNotes] = useState(false);

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
    <div className="w-full space-y-8">
      {/* ── Hero Header ── */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center justify-center gap-3">
            AI Resume Analyzer
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs uppercase font-bold tracking-wider text-primary ring-1 ring-inset ring-primary/20 translate-y-0.5">
              Beta
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-5xl mx-auto text-sm sm:text-base leading-relaxed">
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

          {/* ── Important Notes ── */}
          <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-4 space-y-3 relative overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-warning/70 via-warning/30 to-transparent" />

            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-warning shrink-0" />
              <span className="text-sm font-semibold text-foreground">📌 Important Notes</span>
            </div>

            <ul className="space-y-2.5">
              {[
                {
                  icon: RefreshCw,
                  color: 'text-success',
                  bg: 'bg-success/10',
                  text: (
                    <>
                      If analysis fails, please <span className="font-semibold text-foreground/80">try 2-3 times</span>. Most times it works in 2-3 attempts.
                    </>
                  ),
                },
                {
                  icon: FileWarning,
                  color: 'text-warning',
                  bg: 'bg-warning/10',
                  text: (
                    <>
                      If your <span className="font-semibold text-foreground/80">PDF filename contains numbers</span> (e.g.{' '}
                      <code className="text-[10.5px] bg-muted/60 px-1 py-0.5 rounded">Resume123.pdf</code>), the upload may occasionally fail.{' '}
                      Rename it using only letters (e.g. <code className="text-[10.5px] bg-muted/60 px-1 py-0.5 rounded">UserResume.pdf</code>) and try again.
                    </>
                  ),
                },
                {
                  icon: Wifi,
                  color: 'text-info',
                  bg: 'bg-info/10',
                  text: (
                    <>
                      Use a <span className="font-semibold text-foreground/80">stable internet connection</span> while uploading. A weak connection may interrupt the upload or AI analysis.
                    </>
                  ),
                },
                {
                  icon: ScanText,
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                  text: (
                    <>
                      Upload a <span className="font-semibold text-foreground/80">clear, text-based PDF</span> for best results. Scanned or image-only PDFs may produce less accurate feedback.
                    </>
                  ),
                },
                {
                  icon: HardDrive,
                  color: 'text-muted-foreground',
                  bg: 'bg-muted/40',
                  text: (
                    <>
                      Maximum file size: <span className="font-semibold text-foreground/80">10 MB</span>.
                    </>
                  ),
                },
              ].slice(0, showAllNotes ? undefined : 3).map(({ icon: Icon, color, bg, text }, i) => (
                <li key={i} className="flex items-start gap-2.5 animate-in fade-in duration-300">
                  <span className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-md ${bg}`}>
                    <Icon className={`h-3 w-3 ${color}`} />
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllNotes(!showAllNotes)}
              className="w-full text-xs text-muted-foreground mt-2 hover:bg-warning/10 hover:text-warning-foreground h-7"
            >
              {showAllNotes ? "Hide notes" : "See all notes"}
            </Button>
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
