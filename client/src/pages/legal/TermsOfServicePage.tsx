import { Link } from 'react-router-dom';

export function TermsOfServicePage() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ── Page Header ── */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Last updated: July 18, 2026 · Please read these terms carefully before using CodexAI.
          </p>
        </div>

        {/* ── Document Body ── */}
        <article className="max-w-4xl mx-auto space-y-10">

          {/* ── 1. Introduction ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              1. Introduction
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                Welcome to CodexAI. These Terms of Service ("Terms") govern your access to and use of
                the CodexAI platform, including the website, APIs, and all related services. CodexAI is
                an AI-powered resume analysis and job tracking system built for the OpenAI Codex Hackathon.
              </p>
              <p>
                By creating an account or using any part of the service, you acknowledge that you have
                read, understood, and agree to be bound by these Terms. If you do not agree, you must
                not access or use the service.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 2. Eligibility ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              2. Eligibility
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                You must be at least 16 years of age to create an account and use CodexAI. By using the
                service, you represent that you meet this eligibility requirement.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 3. User Accounts ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              3. User Accounts
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                To access the core features of CodexAI, you must create an account using one of the
                following methods:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Email and password</span> — Your
                  password is securely hashed using Argon2 and is never stored in plain text. You must
                  verify your email address before accessing the application.
                </li>
                <li>
                  <span className="font-medium text-foreground">Google sign-in</span> — You may
                  authenticate using your Google account. We receive your name, email, and Google
                  profile identifier. No password is stored for Google-authenticated accounts.
                </li>
              </ul>
              <p>
                You are responsible for maintaining the security of your account credentials and for all
                activity that occurs under your account. You agree to notify us immediately if you
                suspect any unauthorized access.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 4. Resume Uploads & AI Analysis ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              4. Resume Uploads and AI Analysis
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI allows you to upload a PDF resume (maximum 10 MB) for AI-powered analysis. The
                service extracts text from your document and sends it to our AI providers for evaluation.
                The uploaded PDF file is temporarily processed and then permanently deleted from our
                servers — only the extracted text is retained.
              </p>
              <p>
                The AI analysis includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>An overall verdict indicating how well your resume matches the target role.</li>
                <li>Identification of key strengths and areas for improvement.</li>
                <li>Personalized interview questions based on your resume and, when provided, the
                  target job description.</li>
                <li>Advanced Google search queries designed to help you find relevant job postings
                  and preparation resources.</li>
              </ul>
              <p>
                You may optionally provide a target job description and search preferences to receive
                a more tailored analysis. If no job description is provided, the AI analyzes the resume
                independently.
              </p>
              <p>
                To improve performance and reduce costs, CodexAI generates a SHA-256 hash of your
                inputs and caches analysis results. Identical inputs return cached results instantly
                rather than making a new AI request. Cached entries are automatically deleted after
                30 days.
              </p>
              <p>
                Interview question generation is limited to 5 regeneration attempts per analysis
                session. Each regeneration allows you to configure the number of questions
                (between 10 and 50).
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 5. Job Tracking ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              5. Job Tracking
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI provides a job application tracker that allows you to log and manage your job
                search. You can record details such as company name, job title, application status,
                dates, and personal notes. The job tracker is designed for personal organization and
                does not interact with any third-party job platforms on your behalf.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 6. Email Reminders ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              6. Email Reminders
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                You may optionally set email reminders for your tracked job applications. Reminder
                emails are sent to your registered email address at the time you specify. Reminder
                scheduling is persisted in the database, meaning scheduled reminders survive server
                restarts. We use a third-party email transport provider (Gmail via SMTP) to deliver
                these notifications.
              </p>
              <p>
                Reminder delivery depends on the availability of our backend infrastructure. We do not
                guarantee delivery at the exact scheduled time, particularly if the server is
                experiencing downtime.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 7. Acceptable Use ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              7. Acceptable Use
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                By using CodexAI, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>Upload malicious files, viruses, or code that could harm the application or
                  its users.</li>
                <li>Attempt to bypass rate limits, including the 5-regeneration limit on interview
                  questions.</li>
                <li>Use the service to generate harmful, offensive, or illegal content.</li>
                <li>Scrape, reverse-engineer, or exploit the service's APIs for unauthorized
                  purposes.</li>
                <li>Create multiple accounts to circumvent usage limits or restrictions.</li>
                <li>Misrepresent your identity or impersonate another person.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms or
                abuse the platform's resources.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 8. Third-Party Services ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              8. Third-Party Services
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI relies on the following third-party services to deliver its functionality:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Google Gemini and Groq</span> — AI
                  providers used for resume analysis, interview question generation, and search query
                  generation. Groq serves as an automatic fallback when the primary provider is
                  unavailable.
                </li>
                <li>
                  <span className="font-medium text-foreground">Google OAuth</span> — Used for
                  optional single sign-on authentication.
                </li>
                <li>
                  <span className="font-medium text-foreground">Cloudinary</span> — Cloud storage
                  used for hosting user profile images.
                </li>
                <li>
                  <span className="font-medium text-foreground">MongoDB Atlas</span> — Cloud database
                  used to store user data, analysis results, and job application records.
                </li>
                <li>
                  <span className="font-medium text-foreground">Gmail SMTP</span> — Used to send
                  account verification emails, password reset emails, and job application reminder
                  notifications.
                </li>
              </ul>
              <p>
                Your use of CodexAI is also subject to the terms of service and privacy policies of
                these third-party providers. We are not responsible for outages, policy changes, or
                service interruptions originating from these providers.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 9. Intellectual Property ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              9. Intellectual Property
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                You retain full ownership of any personal data, resumes, and documents you upload to
                CodexAI. We do not claim any intellectual property rights over your content.
              </p>
              <p>
                The CodexAI codebase, design, branding, and original assets are the intellectual
                property of the project creators. You may not copy, modify, distribute, or
                reverse-engineer any part of the application without prior written permission.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 10. Service Availability ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              10. Service Availability
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI is hosted on free-tier infrastructure. The backend server may automatically
                pause after periods of inactivity and restart when a new request is received, which
                can result in initial response delays. We use an external monitoring service to
                minimize downtime, but we do not guarantee 24/7 availability.
              </p>
              <p>
                AI analysis depends on the availability and rate limits of third-party AI provider
                free tiers. If both the primary and fallback providers are unavailable, the service
                will return a temporary error and no analysis results will be generated.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 11. Disclaimer ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              11. Disclaimer
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p className="font-medium text-foreground">
                The service is provided "as is" and "as available" without warranties of any kind,
                whether express or implied.
              </p>
              <p>
                CodexAI is a hackathon project built for demonstration and portfolio purposes. We do
                not guarantee the accuracy, completeness, or reliability of AI-generated analysis,
                interview questions, or search queries. AI-generated content is for informational
                purposes only and should not be treated as professional career, legal, or hiring advice.
              </p>
              <p>
                We do not guarantee data persistence. While we take reasonable steps to protect your
                data, cached analysis results are automatically deleted after 30 days, and the service
                may be modified or discontinued at any time without prior notice.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 12. Limitation of Liability ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              12. Limitation of Liability
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                To the maximum extent permitted by applicable law, the creators of CodexAI shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages, or
                any loss of profits, data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>Your access to, use of, or inability to use the service.</li>
                <li>Any errors, inaccuracies, or omissions in AI-generated content.</li>
                <li>Unauthorized access to or alteration of your data.</li>
                <li>Service interruptions, downtime, or data loss.</li>
              </ul>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 13. Account Termination ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              13. Account Termination
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account at our discretion if you
                violate these Terms, abuse platform resources, or engage in activity that could
                harm the service or its users. We may also discontinue the service entirely at any
                time without prior notice.
              </p>
              <p>
                If you wish to delete your account and associated data, please contact us using the
                information provided below.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 14. Changes to These Terms ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              14. Changes to These Terms
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We may update these Terms from time to time to reflect changes to the service or for
                legal and regulatory reasons. If material changes are made, the "Last updated" date at
                the top of this page will be revised. Your continued use of the service after any
                changes constitutes acceptance of the updated Terms.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 15. Contact ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              15. Contact
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                If you have questions about these Terms of Service or need to report a concern,
                please reach out through the project's GitHub repository or contact the project
                creator directly.
              </p>
              <p>
                Related documents:{' '}
                <Link
                  to="/privacy"
                  className="text-primary hover:text-primary-hover transition-colors underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}
