import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Copy, ExternalLink, Briefcase, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface SearchQuery {
  query: string;
  category: 'job' | 'learning' | 'interview';
}

interface SearchQueriesProps {
  queries: SearchQuery[];
}

export function SearchQueries({ queries }: SearchQueriesProps) {
  const handleCopy = (query: string) => {
    navigator.clipboard.writeText(query);
    toast.success('Query copied to clipboard!');
  };

  const handleOpen = (query: string) => {
    // We construct the Google Search URL and open in a new tab. We do NOT automate or scrape.
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'learning':
        return <BookOpen className="h-4 w-4" />;
      case 'interview':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'job':
        return <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Job</Badge>;
      case 'learning':
        return <Badge variant="secondary" className="capitalize bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Learning</Badge>;
      case 'interview':
        return <Badge variant="secondary" className="capitalize bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Interview</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{category}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b pb-4 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" /> Advanced Search Queries
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          Use these advanced Google search operators (like <code>site:lever.co</code> or <code>intitle:</code>) to find hidden job postings, relevant courses, and interview experiences.
        </p>

        <div className="space-y-4">
          {queries.map((q, idx) => (
            <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-background rounded-md text-muted-foreground shadow-sm">
                    {getCategoryIcon(q.category)}
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-mono text-sm font-semibold truncate text-foreground/90">{q.query}</p>
                    <div className="mt-1">{getCategoryBadge(q.category)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleCopy(q.query)}>
                    <Copy className="h-4 w-4 mr-1.5" /> Copy
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleOpen(q.query)}>
                    <ExternalLink className="h-4 w-4 mr-1.5" /> Search
                  </Button>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
