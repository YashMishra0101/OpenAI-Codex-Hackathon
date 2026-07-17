import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, FileText, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      
      {/* Navigation */}
      <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-primary font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Codex<span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The smart way to land your next role
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
              Supercharge your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">job search</span> with AI.
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Analyze your resume, track your applications, and discover hidden opportunities using advanced search intelligence—all in one elegant platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Link to="/register">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 px-8 text-base border-border hover:bg-muted">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. Free during hackathon.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to get hired</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop using messy spreadsheets. Manage your entire application lifecycle with tools built for modern professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI Resume Checker</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Upload your resume and get instant, actionable feedback powered by advanced language models. Tailor it to specific job descriptions.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Job Tracker</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Organize your applications on a Kanban board, visualize your progress with analytics, and set reminders so you never miss an interview.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6">
                    <Search className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Advanced Google Dorks</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically generate complex search queries to find hidden job postings on Lever and Greenhouse, plus tailored interview prep materials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Built for serious candidates.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                {[
                  "Clean, distraction-free UI",
                  "Secure Google Authentication",
                  "Instant AI feedback",
                  "100% Free forever"
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">CodexAI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Codex AI. Built for the hackathon.
          </p>
          <div className="flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
