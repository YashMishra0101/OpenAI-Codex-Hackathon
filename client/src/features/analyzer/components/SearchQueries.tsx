import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Copy, ExternalLink, Briefcase, BookOpen, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface SearchQuery {
  query: string;
  category: 'job' | 'learning' | 'interview';
}

interface SearchQueriesProps {
  queries: SearchQuery[];
}

export function SearchQueries({ queries }: SearchQueriesProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (query: string) => {
    navigator.clipboard.writeText(query);
    toast.success('Query copied to clipboard!');
  };

  const handleOpen = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  // Filter queries by category
  const jobQueries = queries.filter(q => q.category === 'job');
  const prepQueries = queries.filter(q => q.category === 'learning');
  const expQueries = queries.filter(q => q.category === 'interview');

  // Slice based on expanded state
  const displayJob = expanded ? jobQueries : jobQueries.slice(0, 6);
  const displayPrep = expanded ? prepQueries : prepQueries.slice(0, 2);
  const displayExp = expanded ? expQueries : expQueries.slice(0, 2);

  const renderQueryGroup = (title: string, icon: React.ReactNode, groupQueries: SearchQuery[]) => {
    if (groupQueries.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-foreground/80">
          {icon} {title}
        </h3>
        <div className="space-y-3">
          {groupQueries.map((q, idx) => (
            <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="truncate flex-1">
                  <p className="font-mono text-sm font-semibold truncate text-foreground/90">{q.query}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleCopy(q.query)}>
                    <Copy className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">Copy</span>
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleOpen(q.query)}>
                    <ExternalLink className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">Search</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardHeader className="border-b pb-4 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" /> Advanced Search Queries (Google Dorks)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col flex-1">
        <p className="text-sm text-muted-foreground mb-6">
          Use these advanced Google search operators (like <code>site:</code>, <code>intitle:</code>, and exact match quotes <code>""</code>) to find hidden job postings, technical resources, and company-specific interview experiences.
        </p>

        <div className="flex-1">
          {renderQueryGroup('Job Search', <Briefcase className="h-4 w-4 text-blue-500" />, displayJob)}
          {renderQueryGroup('Interview Preparation', <BookOpen className="h-4 w-4 text-purple-500" />, displayPrep)}
          {renderQueryGroup('Interview Experience', <MessageSquare className="h-4 w-4 text-orange-500" />, displayExp)}
        </div>

        {!expanded && queries.length > 10 && (
          <div className="mt-6 text-center border-t border-border pt-4">
            <Button variant="outline" onClick={() => setExpanded(true)} className="w-full sm:w-auto">
              <ChevronDown className="mr-2 h-4 w-4" /> Load 5 More Queries
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
