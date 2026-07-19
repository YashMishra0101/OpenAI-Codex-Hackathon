import { Link } from 'react-router-dom';
import { GithubLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react';

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/YashMishra0101',
    icon: GithubLogo,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/yash-mishra-356280223/',
    icon: LinkedinLogo,
  },
  {
    name: 'X',
    href: 'https://x.com/YashRKMishra1',
    icon: XLogo,
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Column 1 — Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-primary font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold tracking-tight">
                Codex<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered resume analysis and job tracking. Built for the OpenAI Codex Hackathon.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/analyzer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Job Tracker
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CodexAI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built by{' '}
            <a
              href="https://github.com/YashMishra0101"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              Yash Mishra
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
