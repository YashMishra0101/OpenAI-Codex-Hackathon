import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Copy, ExternalLink, Briefcase, BookOpen, MessageSquare, ChevronDown, Check } from 'lucide-react';
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
    navigator.clipboard.writeText(text);
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
