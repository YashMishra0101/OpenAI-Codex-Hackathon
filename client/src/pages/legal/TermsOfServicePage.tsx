import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">C</span>
            </div>
            <span className="text-foreground">Codex<span className="text-primary">AI</span></span>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
              Legal Information
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Terms of Service</h1>
          </div>

          <div className="bg-[#111621] border border-primary/10 rounded-3xl p-6 md:p-12 shadow-2xl space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Introduction
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  Welcome to CodexAI. These Terms of Service ("Terms") govern your access to and use of our 
                  website, products, and services. CodexAI is currently a project built for a hackathon. By accessing 
                  or using our service, you agree to be bound by these Terms.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                Purpose of the Application
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  CodexAI is a demonstration application designed to provide AI-powered resume analysis, interview 
                  question generation, and job tracking functionality. As a hackathon project, it is provided 
                  primarily for demonstration, educational, and testing purposes.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</span>
                As-Is Service & Disclaimers
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p className="font-semibold text-white">
                  The service is provided "AS IS" and "AS AVAILABLE".
                </p>
                <p>
                  Because this is an experimental hackathon project utilizing free-tier third-party APIs, we do not 
                  guarantee uptime, data persistence, accuracy of AI generation, or continued availability of the 
                  service. We reserve the right to modify, suspend, or discontinue the service at any time without 
                  notice.
                </p>
                <p>
                  The AI-generated advice (including resume feedback and interview questions) is for informational 
                  purposes only and should not be considered professional career or legal advice.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">4</span>
                Acceptable Use & User Responsibilities
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  By using CodexAI, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                  <li>Upload malicious files, viruses, or code that could harm the application.</li>
                  <li>Attempt to bypass rate limits (such as the strict 5-generation limit on AI interview questions).</li>
                  <li>Use the service to generate harmful, offensive, or illegal content.</li>
                  <li>Attempt to scrape, reverse engineer, or exploit the service's APIs.</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these terms or abuse the 
                  provided free-tier resources.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">5</span>
                Third-Party Services
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  CodexAI relies on several third-party services to function, including but not limited to 
                  Google Gemini and Groq (for AI processing), Google OAuth (for authentication), and Cloudinary 
                  (for image hosting). Your use of CodexAI is also subject to the acceptable use policies of these 
                  respective third-party providers. We are not responsible for outages or changes in service from 
                  these third parties.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">6</span>
                Intellectual Property
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  You retain all rights to the personal data and resumes you upload to the service. The CodexAI 
                  codebase, design, and original assets remain the intellectual property of the project creators.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">7</span>
                Limitation of Liability
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  To the maximum extent permitted by law, the creators of CodexAI shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, or any loss of profits, 
                  data, use, goodwill, or other intangible losses, resulting from your access to or use of 
                  (or inability to access or use) the service.
                </p>
              </div>
            </section>
            
          </div>
        </div>
      </main>
      
      <footer className="border-t py-8 mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CodexAI Hackathon Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
