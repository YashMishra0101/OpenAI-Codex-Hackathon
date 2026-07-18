import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Copy, ExternalLink, Briefcase, BookOpen, MessageSquare, ChevronDown, Check, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface SearchQuery {
  query: string;
  category: 'job' | 'learning' | 'interview';
}

interface SearchQueriesProps {
  queries: SearchQuery[];
}

/* ─── Category Config ───────────────────────────────────────────────────────── */

const CATEGORY_CONFIG = {
  job: {
    label: 'Job Search',
    icon: Briefcase,
    border: 'border-l-info',
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
  },
  learning: {
    label: 'Interview Preparation',
    icon: BookOpen,
    border: 'border-l-accent',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
  },
  interview: {
    label: 'Interview Experiences',
    icon: MessageSquare,
    border: 'border-l-warning',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
  },
} as const;

/* ─── Copy Button with feedback ─────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export function SearchQueries({ queries }: SearchQueriesProps) {
  const [expanded, setExpanded] = useState(false);

  const handleOpen = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  // Group queries by category
  const jobQueries = queries.filter((q) => q.category === 'job');
  const prepQueries = queries.filter((q) => q.category === 'learning');
  const expQueries = queries.filter((q) => q.category === 'interview');

  // Slice based on expanded state
  const displayJob = expanded ? jobQueries : jobQueries.slice(0, 4);
  const displayPrep = expanded ? prepQueries : prepQueries.slice(0, 2);
  const displayExp = expanded ? expQueries : expQueries.slice(0, 2);

  const totalDisplayed = displayJob.length + displayPrep.length + displayExp.length;
  const totalAvailable = queries.length;
  const hasMore = !expanded && totalDisplayed < totalAvailable;

  const renderQueryGroup = (category: 'job' | 'learning' | 'interview', groupQueries: SearchQuery[]) => {
    if (groupQueries.length === 0) return null;
    const config = CATEGORY_CONFIG[category];
    const Icon = config.icon;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className={`w-7 h-7 rounded-md ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <h4 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
            {config.label}
          </h4>
          <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal">
            {groupQueries.length}
          </Badge>
        </div>

        <div className="space-y-2.5">
          {groupQueries.map((q, idx) => (
            <div
              key={idx}
              className={`group flex items-center gap-3 p-4 rounded-lg border border-border/40 bg-surface/40 hover:border-border hover:bg-surface-raised/50 transition-colors border-l-2 ${config.border}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-foreground/90 break-all leading-relaxed">
                  {q.query}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CopyButton text={q.query} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpen(q.query)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-5">
        <CardTitle className="text-lg flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="h-[18px] w-[18px] text-primary" />
          </div>
          Google Dorks — Advanced Search Queries
          <Badge variant="secondary" className="ml-auto text-xs px-2.5 py-0.5 font-normal">
            {totalAvailable} queries
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Use these advanced Google search operators (<code className="text-primary/80">site:</code>,{' '}
          <code className="text-primary/80">intitle:</code>,{' '}
          <code className="text-primary/80">""</code>) to surface hidden job postings, technical resources, and interview experiences.
        </p>

        {/* Distribution info note */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border/40 rounded-lg px-4 py-2.5">
          <span className="font-medium text-foreground">Default: 15 queries</span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-info" />
            8 Job Search
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            4 Interview Prep
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-warning" />
            3 Interview Experiences
          </span>
        </div>

        {/* ── Why use Google Dorks banner ── */}
        <div className="rounded-lg border border-border/40 bg-gradient-to-br from-primary/5 via-accent/5 to-warning/5 px-4 py-3.5 space-y-2.5 relative overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/60 via-accent/50 to-warning/50" />

          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
            <span className="text-sm font-semibold text-foreground">Why use these Google Dorks?</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            These AI-generated queries are tailored to your resume and use advanced search operators to uncover{' '}
            <span className="text-info font-semibold">hidden job opportunities</span>,{' '}
            <span className="text-accent font-semibold">interview preparation resources</span>, and{' '}
            <span className="text-warning font-semibold">real interview experiences</span>{' '}
            that often don't appear in regular Google searches.
          </p>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 text-[10.5px] font-semibold text-yellow-400">
              📝 Note
            </span>
            <span className="text-xs text-muted-foreground">Please copy the generated query and paste it into Google to view the search results.</span>
          </div>
        </div>

        {renderQueryGroup('job', displayJob)}
        {renderQueryGroup('learning', displayPrep)}
        {renderQueryGroup('interview', displayExp)}

        {hasMore && (
          <div className="pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
              Show all queries ({totalAvailable - totalDisplayed} more)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
