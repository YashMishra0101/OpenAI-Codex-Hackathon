import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ── Page Header ── */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Last updated: July 18, 2026 · This policy explains how CodexAI collects, uses, and protects your information.
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
                At CodexAI, we take your privacy seriously. This Privacy Policy explains what
                information we collect, how we use it, and the measures we take to protect it.
                CodexAI is an AI-powered resume analysis and job tracking system built for the
                OpenAI Codex Hackathon.
              </p>
              <p>
                Our primary goal is demonstrating functionality, not monetizing your data.
                <span className="font-medium text-foreground"> We do not sell, rent, or share your
                personal data with advertisers. We do not use your data for profiling or targeted
                advertising.</span>
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 2. Information We Collect ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              2. Information We Collect
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We collect only the information necessary to provide the core functionality of
                the application:
              </p>
              <ul className="list-disc pl-6 space-y-2.5 marker:text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Account information</span> — When
                  you register with email and password, we collect your name, email address, and a
                  securely hashed version of your password (using Argon2). If you sign in via Google,
                  we receive your Google profile identifier, name, and email address. No password is
                  stored for Google-authenticated accounts.
                </li>
                <li>
                  <span className="font-medium text-foreground">Profile media</span> — If you
                  upload a profile picture, it is stored on Cloudinary (our cloud storage provider).
                  When you update or remove your profile picture, the previous image is actively
                  deleted from Cloudinary's servers.
                </li>
                <li>
                  <span className="font-medium text-foreground">Resume data</span> — When you
                  upload a PDF resume for analysis, we extract the text content from the document.
                  The original PDF file is immediately and permanently deleted from our servers after
                  text extraction. Only the extracted text is retained.
                </li>
                <li>
                  <span className="font-medium text-foreground">Analysis data</span> — We store
                  the job descriptions and search preferences you provide, along with the AI-generated
                  analysis results, interview questions, and search queries associated with your
                  account.
                </li>
                <li>
                  <span className="font-medium text-foreground">Job application data</span> — If
                  you use the job tracker, we store the company names, job titles, application
                  statuses, dates, notes, and any reminder schedules you create.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 3. How We Handle Your Resumes ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              3. How We Handle Your Resumes
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We understand the sensitivity of professional documents. When you upload a PDF
                resume to CodexAI:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>The file is temporarily received by our server using disk-based storage to
                  prevent memory overload.</li>
                <li>We extract the raw text content from the document.</li>
                <li className="font-medium text-foreground">The original PDF file is immediately
                  and permanently deleted from our servers.</li>
              </ul>
              <p>
                We retain the extracted text in our secure database so that you can view your past
                AI analyses, regenerate interview questions, and reference previous results. A
                SHA-256 hash of the combined inputs (resume text, job description, and preferences)
                is generated for caching purposes. Cached analysis entries are automatically
                deleted after 30 days via a database time-to-live index.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 4. How We Use Your Information ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              4. How We Use Your Information
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                Your information is used exclusively to provide and maintain the services you
                request:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>Authenticating your identity and managing your account session.</li>
                <li>Sending your extracted resume text and job description to our AI providers
                  to generate analysis results, interview questions, and search queries.</li>
                <li>Storing your job application records and displaying your tracking dashboard.</li>
                <li>Sending transactional emails, including account verification, password resets,
                  and job application reminder notifications you have scheduled.</li>
                <li>Caching analysis results to improve response times for identical requests.</li>
              </ul>
              <p>
                We do not use your data for any purpose beyond delivering the features described
                above.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 5. Third-Party Services ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              5. Third-Party Services
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                To provide AI and cloud features, we transmit specific data to trusted third-party
                providers:
              </p>
              <ul className="list-disc pl-6 space-y-2.5 marker:text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Google Gemini (primary) and OpenRouter
                  (fallback)</span> — Your extracted resume text, job descriptions, and search
                  preferences are sent to these AI providers for the purpose of generating analysis
                  results and interview questions. OpenRouter is used automatically if the primary
                  provider is unavailable.
                </li>
                <li>
                  <span className="font-medium text-foreground">Cloudinary</span> — Used
                  exclusively for hosting profile images. Old images are actively deleted when you
                  update or remove your profile picture.
                </li>
                <li>
                  <span className="font-medium text-foreground">Google OAuth</span> — Used if you
                  choose to authenticate via your Google account. We receive only your name, email,
                  and Google profile identifier.
                </li>
                <li>
                  <span className="font-medium text-foreground">MongoDB Atlas</span> — Our cloud
                  database provider. All user data, analysis results, and job application records
                  are stored in MongoDB Atlas.
                </li>
                <li>
                  <span className="font-medium text-foreground">Gmail SMTP (via Nodemailer)</span> — Used
                  to send account verification emails, password reset emails, and job application
                  reminder notifications.
                </li>
              </ul>
              <p>
                We only share the minimum data necessary with each provider to deliver the
                requested functionality. We do not share your data with any parties beyond those
                listed above.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 6. Cookies and Authentication ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              6. Cookies and Authentication
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI uses JSON Web Tokens (JWT) for session management, with separate access
                and refresh tokens. These tokens are stored as HttpOnly, secure cookies that cannot
                be accessed by client-side JavaScript, protecting against Cross-Site Scripting (XSS)
                attacks.
              </p>
              <p>
                <span className="font-medium text-foreground">We do not use tracking cookies,
                advertising cookies, or third-party analytics cookies.</span> The only cookies
                set by CodexAI are strictly necessary for authentication.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 7. Data Security ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              7. Data Security
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We implement multiple layers of security to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>Passwords are hashed using Argon2, a memory-hard algorithm designed to resist
                  brute-force attacks. Passwords are never stored or logged in plain text.</li>
                <li>All data in transit is protected using HTTPS encryption.</li>
                <li>Security headers are enforced using Helmet.js to protect against common web
                  vulnerabilities.</li>
                <li>All user inputs are validated at runtime using Zod schema validation to prevent
                  injection attacks and malformed data.</li>
                <li>Uploaded files are processed using disk-based storage and immediately deleted
                  after text extraction to prevent sensitive documents from persisting on the
                  server.</li>
              </ul>
              <p>
                While we take reasonable measures to protect your data, no system can guarantee
                absolute security. We encourage you to use a strong, unique password for your
                account.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 8. Data Retention ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              8. Data Retention
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                Your account data, profile information, and job application records are retained
                for as long as your account remains active.
              </p>
              <p>
                Cached AI analysis results are automatically deleted after 30 days through a
                MongoDB TTL (time-to-live) index. This prevents stale data from accumulating
                and ensures that outdated analyses are not stored indefinitely.
              </p>
              <p>
                Uploaded PDF files are deleted immediately after text extraction and are never
                stored long-term.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 9. Your Rights ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              9. Your Rights
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-muted-foreground">
                <li>Access the personal data stored in your account through the profile settings
                  page.</li>
                <li>Update your name, email address, profile picture, and social links at any
                  time.</li>
                <li>Change your password (for email-authenticated accounts).</li>
                <li>Request complete deletion of your account and all associated data by
                  contacting the project creator.</li>
              </ul>
              <p>
                Because CodexAI is a hackathon project, account deletion requests are processed
                manually. To request data deletion, please reach out through the contact
                information provided below.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 10. Children's Privacy ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              10. Children's Privacy
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                CodexAI is not intended for use by individuals under the age of 16. We do not
                knowingly collect personal information from children. If you believe that a child
                has provided us with personal data, please contact us and we will take steps to
                delete that information.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 11. Changes to This Policy ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              11. Changes to This Policy
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time to reflect changes to the
                service or for legal and regulatory reasons. If material changes are made, the
                "Last updated" date at the top of this page will be revised. Your continued use
                of the service after any changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* ── 12. Contact ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              12. Contact
            </h2>
            <div className="space-y-3 text-[15px] text-foreground/80 leading-relaxed">
              <p>
                If you have questions about this Privacy Policy, want to exercise your data rights,
                or need to report a concern, please reach out through the project's GitHub
                repository or contact the project creator directly.
              </p>
              <p>
                Related documents:{' '}
                <Link
                  to="/terms"
                  className="text-primary hover:text-primary-hover transition-colors underline underline-offset-2"
                >
                  Terms of Service
                </Link>
              </p>
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}
