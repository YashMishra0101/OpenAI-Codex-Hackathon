import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Briefcase,
  Search,
  ArrowRight,
  Upload,
  BrainCircuit,
  CalendarCheck,
  Star,
  Shield,
  Zap,
  Clock,
} from 'lucide-react';
import { GithubLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react';

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: FileText,
    title: 'AI Resume Analysis',
    description:
      'Upload your resume and get instant, structured feedback powered by advanced language models.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    bullets: [
      'Missing keywords & skill gaps',
      'Actionable improvement suggestions',
      'Personalized interview questions',
    ],
  },
  {
    icon: Briefcase,
    title: 'Smart Job Tracker',
    description:
      'Organize every application in one dashboard with status tracking and email reminders.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    bullets: [
      '9 granular status stages',
      'Email reminders for interviews',
      'Notes and job URL tracking',
    ],
  },
  {
    icon: Search,
    title: 'Google Dorks Generator',
    description:
      'AI-generated advanced search queries to surface hidden job postings across the web.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    bullets: [
      'Targeted job-search queries',
      'Interview prep materials',
      'Copy or open in Google instantly',
    ],
  },
] as const;

const STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload your resume',
    description: 'Drop a PDF and optionally paste a job description. The system handles the rest.',
  },
  {
    step: '02',
    icon: BrainCircuit,
    title: 'Get AI-powered insights',
    description:
      'Receive a match verdict, improvement suggestions, interview questions, and search queries.',
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Track & follow up',
    description:
      'Log applications, monitor your pipeline, and set email reminders so nothing slips.',
  },
] as const;

interface TechItem {
  name: string;
  category: string;
}

const TECH_STACK: TechItem[] = [
  { name: 'React 19', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Vite 8', category: 'Frontend' },
  { name: 'TailwindCSS 4', category: 'Frontend' },
  { name: 'shadcn/ui', category: 'Frontend' },
  { name: 'TanStack Query', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'JWT + argon2', category: 'Backend' },
  { name: 'Agenda.js', category: 'Backend' },
  { name: 'Gemini 3.5 Flash', category: 'AI' },
  { name: 'Groq (Fallback)', category: 'AI' },
  { name: 'MongoDB Atlas', category: 'Database' },
  { name: 'Mongoose', category: 'Database' },
  { name: 'Cloudinary', category: 'Storage' },
  { name: 'Nodemailer', category: 'Email' },
  { name: 'Vercel', category: 'Hosting' },
  { name: 'Render', category: 'Hosting' },
  { name: 'Sentry', category: 'Monitoring' },
  { name: 'GitHub Actions', category: 'CI/CD' },
];

const TRUST_ITEMS = [
  { icon: Zap, text: 'Instant AI feedback' },
  { icon: Clock, text: '100% free forever' },
  { icon: Shield, text: 'Secure & reliable' },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative px-4 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden"
        >
          {/* Background texture */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid-fade pointer-events-none" />

          {/* Soft ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center z-10">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2" />
              Built for the OpenAI Codex Hackathon
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                CodexAI
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-3xl mx-auto mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              AI-powered resume analysis and job tracking system. Upload your resume,
              get instant AI feedback and track every application in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
              >
                <Link to="/register">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-12 px-8 text-base border-border hover:bg-surface-raised"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary/70" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section id="features" className="py-16 lg:py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything you need to get hired
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop juggling spreadsheets and disconnected tools. Manage your entire
                job search from resume to offer in one platform.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="bg-surface/50 border-border/50 hover:border-border transition-colors"
                  >
                    <CardContent className="pt-8 pb-8 px-6">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-lg ${feature.bgColor} flex items-center justify-center mb-5`}
                      >
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>

                      {/* Title & description */}
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                        {feature.description}
                      </p>

                      {/* Bullet points */}
                      <ul className="space-y-2.5">
                        {feature.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-surface/30 border-y border-border/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Three steps from resume upload to organized job pipeline.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative text-center">
                    {/* Connecting line (desktop only) */}
                    {index < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-border/60" />
                    )}

                    {/* Step number + Icon */}
                    <div className="relative inline-flex flex-col items-center">
                      <span className="text-xs font-semibold text-primary/60 tracking-widest uppercase mb-3">
                        Step {item.step}
                      </span>
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Technology Stack ──────────────────────────────────────────────── */}
        <section id="tech-stack" className="py-16 lg:py-24 border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Built with modern technologies
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Production-grade stack designed for reliability, performance, and scalability.
              </p>
            </div>

            {/* Tech grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {TECH_STACK.map((tech) => (
                <div
                  key={tech.name}
                  className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-surface/40 px-4 py-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {tech.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{tech.category}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Source / Attribution ─────────────────────────────────────── */}
        <section id="open-source" className="py-24 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border/50 bg-surface/30 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                <Star className="h-6 w-6 text-primary" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Open source & hackathon-built
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                This project is built for the OpenAI Codex Hackathon hosted on{' '}
                <span className="text-foreground font-medium">namasteDev.com</span>, organized by{' '}
                <span className="text-foreground font-medium">Akshay Saini</span>. The entire
                codebase is open source.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="outline" size="lg" asChild className="h-11 gap-2">
                  <a
                    href="https://github.com/YashMishra0101/OpenAI-Codex-Hackathon"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubLogo className="h-4 w-4" />
                    Star on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-11 gap-2">
                  <a
                    href="https://www.linkedin.com/in/yash-mishra-356280223/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinLogo className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-11 gap-2">
                  <a
                    href="https://x.com/YashRKMishra1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <XLogo className="h-4 w-4" />
                    X (Twitter)
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section id="cta" className="py-24 lg:py-32 border-t border-border/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to supercharge your job search?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Upload your resume, get AI insights, and start tracking your applications all for free. No credit card required.
            </p>
            <Button
              size="lg"
              asChild
              className="h-12 px-10 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              <Link to="/register">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
