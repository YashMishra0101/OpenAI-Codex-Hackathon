import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const analyzerFormSchema = z.object({
  jobDescription: z.string().optional(),
  searchPreferences: z.string().optional(),
});

type AnalyzerFormValues = z.infer<typeof analyzerFormSchema>;

interface AnalyzerFormProps {
  onSubmit: (data: { resume: File; jobDescription?: string; searchPreferences?: string }) => void;
  isLoading: boolean;
}

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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h2>
        <p className="text-muted-foreground mt-2">
          Upload your resume and an optional job description to get tailored feedback, interview questions, and job search queries.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* File Upload Zone */}
          <div className="space-y-2">
            <FormLabel>Resume PDF <span className="text-red-500">*</span></FormLabel>
            <div
              {...getRootProps()}
              className={`group relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border hover:border-primary/50 hover:bg-muted/30'
              } ${fileError ? 'border-destructive bg-destructive/5' : ''}`}
            >
              <input {...getInputProps()} />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">
                      <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">PDF format, up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
          </div>

          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Job Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the job description here for tailored analysis..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="searchPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Preferences (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="E.g. Remote only, Senior roles in Fintech..."
                    className="min-h-[80px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || !resumeFile}>
            {isLoading ? 'Analyzing Resume...' : 'Analyze Resume'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
