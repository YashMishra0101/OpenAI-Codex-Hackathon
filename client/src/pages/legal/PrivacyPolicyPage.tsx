import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Privacy Policy</h1>
          </div>

          <div className="bg-[#111621] border border-primary/10 rounded-3xl p-6 md:p-12 shadow-2xl space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Introduction
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  At CodexAI, we take your privacy seriously. This Privacy Policy explains what information we 
                  collect, how we use it, and how we protect it. Because CodexAI is built as a hackathon project, 
                  our primary goal is demonstrating functionality, not monetizing your data. <span className="font-semibold text-white">We do not sell, 
                  rent, or use your personal data for advertising or profiling.</span>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                Information We Collect
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  We only collect information necessary to provide the core functionality of the application:
                </p>
                <ul className="list-disc pl-5 space-y-3 marker:text-primary">
                  <li>
                    <strong className="text-white">Account Information:</strong> When you register, we collect your name, email address, 
                    and a securely hashed version of your password (using Argon2). If you sign in via Google, we 
                    collect your Google ID, name, and email address.
                  </li>
                  <li>
                    <strong className="text-white">Profile Media:</strong> If you upload a profile picture, it is hosted securely on our 
                    cloud storage provider (Cloudinary).
                  </li>
                  <li>
                    <strong className="text-white">Resume Data:</strong> When you upload a PDF resume for analysis, we extract the text 
                    from the document.
                  </li>
                  <li>
                    <strong className="text-white">Application Data:</strong> We store job descriptions you provide, your search preferences, 
                    and the AI-generated feedback and questions associated with your account.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</span>
                How We Handle Your Resumes (File Deletion)
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  We respect the sensitivity of your professional documents. When you upload a PDF resume to CodexAI:
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                  <li>The file is temporarily received by our server.</li>
                  <li>We extract the raw text from the document in memory.</li>
                  <li className="text-emerald-400 font-medium">The original PDF file is immediately and permanently deleted from our servers.</li>
                </ul>
                <p>
                  We only store the extracted raw text in our secure database to enable you to view your past AI 
                  analyses and generate interview questions at a later time.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">4</span>
                Third-Party Services
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  To provide our AI and cloud features, we securely transmit specific data to trusted third-party providers:
                </p>
                <ul className="list-disc pl-5 space-y-3 marker:text-primary">
                  <li>
                    <strong className="text-white">Google Gemini & Groq:</strong> Your extracted resume text, job descriptions, and search 
                    preferences are sent to these AI providers exclusively for the purpose of generating analysis and 
                    interview questions.
                  </li>
                  <li>
                    <strong className="text-white">Cloudinary:</strong> Used exclusively for hosting profile images. When you update or 
                    remove your profile picture, the old image is actively deleted from Cloudinary's servers.
                  </li>
                  <li>
                    <strong className="text-white">Google OAuth:</strong> Used if you choose to authenticate via your Google account.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">5</span>
                Cookies and Authentication
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  We use strictly necessary, HttpOnly, secure cookies to manage your authentication state 
                  (Access and Refresh tokens). These cookies cannot be accessed by client-side scripts, protecting 
                  you against Cross-Site Scripting (XSS) attacks. <span className="font-semibold text-white">We do not use tracking, advertising, or 
                  third-party analytics cookies.</span>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">6</span>
                Data Protection & User Rights
              </h2>
              <div className="pl-11 space-y-4 text-zinc-300 leading-relaxed text-[1.05rem]">
                <p>
                  All data in transit is protected using standard encryption protocols. Your passwords are never 
                  stored in plain text. As a user, you have the right to access the data stored in your account. 
                  Because this is a hackathon project, if you wish to have your data completely purged from the 
                  database, please contact the project creators.
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
