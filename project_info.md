# AI-Powered Resume Analysis & Job Tracking System

> Built for the **OpenAI Codex Hackathon**.

> **Status:** 🔨 Work in Progress

An all-in-one AI-powered platform that helps candidates improve their resumes and manage their job search in a simple, organized way. It combines AI resume analysis with job application tracking so users can move from preparation to follow-up in one place.

---

## 🧑‍💻 CORE FEATURES

### Quick Overview of MVP

|  | Feature | Description |
|---|---------|-------------|
| 1 | **AI-Powered Resume Checker** | Upload PDF, paste JD/role, AI analysis, Match Verdict, Suggestions + Interview Questions |
| 2 | **Job Tracker** | Track applications, stats, reminders |
| 3 | **Future feature** | Intentionally undecided; choose only after validating a distinct, high-value user workflow |

---

## 🧑‍💻 TECHNICAL HIGHLIGHTS

This project goes beyond a typical MERN stack application. Here are the key differentiators:

| Feature | Technology | What It Does |
|---------|------------|--------------|
| **AI Integration** | Google Gemini 3.5 Flash + Groq API | Intelligent resume analysis with AI provider fallback for reliability |
| **Type Safety** | TypeScript (strict mode) + Zod | Compile-time contracts plus runtime validation at every untrusted boundary |
| **System Design** | Scalable Architecture | Modular folder structure, clean code patterns, and database design best practices |
| **Performance & Cost** | SHA-256 Caching | Hashes inputs to bypass redundant API calls, dropping latency from ~5s down to ~50ms and saving free-tier tokens |
| **Web Security** | Helmet.js, Zod, JWT, express-rate-limit | Security headers, robust validation, XSS prevention, and API quota protection |
| **Observability** | Winston Structured Logging | Captures detailed insights into auth failures, token lifecycle, and critical API flows without exposing sensitive data |

---

## 🛠️ TECH STACK

### Quick Overview

| Category | Technologies |
|---|---|
| **Language** | TypeScript (strict mode) across the client and server; JavaScript is only the runtime output |
| **Frontend** | TypeScript, React 19, React Compiler, Vite, TailwindCSS 4, shadcn/ui, React Router v7 (library mode — SPA), TanStack Query, Axios, React Hook Form, Zod, React Hot Toast, Phosphor Icons |
| **Backend** | TypeScript, Node.js, Express, JWT, argon2, Multer, pdf-parse, Agenda.js |
| **Testing** | Vitest, React Testing Library (Frontend), Supertest (Backend API) |
| **AI** | Google Gemini 3.5 Flash API free tier (primary) + Groq API free tier (fallback) |
| **Database** | MongoDB Atlas + Mongoose (ODM) |
| **Storage** | Cloudinary |
| **Email** | Resend |
| **Hosting** | Vercel (Frontend), Render (Backend), UptimeRobot (Keep-Alive) |
| **Monitoring** | Sentry (Free: 5K errors/month) |
| **CI/CD** | GitHub Actions (lint + test on push) |

---

## 🔐 FOUNDATION: USER AUTHENTICATION & PROFILE

### Signup Options

**Email + Password**
User enters Name, Email, Password. Account created. Verification email sent. After verification → Main landing page.

**Google Login**
One-click signup/login using `@react-oauth/google` (Google's official React SDK) on the frontend and `google-auth-library` (Google's official Node.js package) on the backend for ID token verification. No password needed. Account linked to Google profile.

**Guest Mode**
Try the app without signup. **Only AI-Powered Resume Checker feature is available.** To protect system resources, Guest Mode enforces a strict IP-based rate limit combined with **Cloudflare Turnstile**. This prevents automated proxy-rotator bots from bypassing IP limits and draining our AI API quotas. Other features require a full account.

### Login
- Email + Password OR Google OAuth
- JWT tokens (Access + Refresh)
- Redirect to the main page after successful verification

### Auth Rate Limiting (Brute-Force Protection)
Auth routes are protected with a separate `express-rate-limit` configuration to prevent brute-force and credential-stuffing attacks:
- **`/login`** — 10 attempts per 15 minutes per IP
- **`/register`** — 5 attempts per 15 minutes per IP
- **`/forgot-password`** — 3 attempts per 15 minutes per IP

This is independent of the AI route rate limiter. Even though passwords are hashed with argon2, rate limiting stops the attack before it reaches the hashing layer — defense in depth.

### Structured Auth Logging (Observability)
To ensure the authentication system is fully observable and debuggable in production, structured logging (via Winston) tracks critical flows without exposing sensitive data (no passwords or tokens):
- **Login Attempts:** Logs successful logins and failures (invalid credentials, user not found).
- **Token Lifecycle:** Logs access token generation, refresh token usage, and token expirations.
- **Security Violations:** Logs unauthorized access to protected routes and missing/invalid JWTs.
- **Contextual Data:** Every auth log includes a timestamp, event type, route, HTTP method, and sanitized error messages.

---

## 👤 FOUNDATION: PROFILE MANAGEMENT

After signup or login, users can manage their profile:

### Profile Settings
- **Update Name** — Change display name anytime
- **Upload Profile Image** — Upload or change profile picture (JPG/PNG, max 2MB)
- **Social Links (Optional)** — Add LinkedIn, GitHub, and Portfolio website URLs
- **Change Email** — Update email address (requires verification of new email)
- **Password Management** — Change password (only for email/password accounts, not OAuth users)

All profile changes are saved to MongoDB and reflected immediately across the app.

---

## 📄 FEATURE 1: AI-POWERED RESUME CHECKER

### How It Works
1. User uploads resume **(PDF only, max 5MB)**
2. User enters job details in text box:
   - **Paste job description** from company website, OR
   - **Write what kind of job** they are looking for (e.g., "Frontend developer role with React and TypeScript")
   - **Or skip it entirely** — the system will analyze the resume on its own and generate suggestions and interview questions based on the resume content alone
3. User can optionally add search preferences, such as target location, remote preference, target companies, or learning goals.
4. **Caching Check (Performance/Cost Optimization):** The backend generates a SHA-256 hash of the extracted resume text + job description + search preferences. It checks MongoDB:
   - *If an identical hash exists* → Instantly returns the previous analysis results (Latency: ~50ms, Cost: Free).
   - *If no match* → Proceeds to the AI API.
5. AI analyzes the resume (and job description/search preferences when provided) using Gemini 3.5 Flash API (`gemini-3.5-flash` model) with Groq Qwen 3.6 27B (`qwen/qwen3.6-27b`) as automatic fallback.
6. Shows an overall verdict followed by three structured sub-features.
7. Analysis results (along with the unique SHA-256 content hash) are **saved to the database** — users can view their past analyses anytime, and the system can reuse the data for future identical requests.
8. **Cache TTL (Privacy/Cleanup):** A MongoDB TTL index automatically deletes cached analysis entries after 30 days. This prevents stale data from accumulating indefinitely and ensures guest analyses (which have no user-initiated delete option) are cleaned up automatically.

### Analysis Results

**Overall Resume Verdict (Top Summary — not a separate feature)**
- Display this summary before every detailed result.
- One of three categories:
  - 🟢 **Strong Match** — "Your resume aligns well with this role"
  - 🟡 **Partial Match** — "Some gaps need attention"
  - 🔴 **Weak Match** — "Significant improvements are needed"
**Sub-feature 1: Resume Analysis**
- **Missing Skills/Keywords** — Skills or keywords from the job description that are not present in the resume
- **What's Working** — Specific strengths, well-written sections, and evidence that align with the role
- **Improvement Suggestions** — Missing information, weak sections, formatting concerns, ATS optimization gaps, and actionable recommendations

**Sub-feature 2: AI Interview Question Generator**
- Users can select the number of questions they want to generate (between **10 and 50**, default is **30**)
- Personalized interview questions based on the job description and the resume
- Questions cover experience, tech stack, projects, and behavioral topics
- If no job description is provided, questions are generated based on the resume content alone

**Sub-feature 3: Google Dorks Generator (Advanced Search Queries)**
- Based on the resume, optional job description, and optional search preferences, generate **10 high-quality Google search queries by default**.
- Default distribution: **8 job-search queries**, **1 learning-material query**, and **1 interview-experience query** — an 80% job-search / 20% preparation split.
- Job-search queries can target company career pages, LinkedIn, Wellfound, Naukri, Indeed, and other public job sources using supported Google operators such as exact phrases, exclusions, `site:`, and `after:`.
- The preparation queries can target company-specific interview experiences, interview questions, technical documentation, GitHub repositories, learning resources, and discussion forums.
- Every query is displayed as a readable card that can be copied or opened in a new Google-search tab.
- A **Generate 5 More Queries** action can extend the result to a hard maximum of **15** queries. At the maximum, return **12 job-search** and **3 preparation** queries to preserve the 80/20 split.
- The application generates query text only. It does **not** scrape Google or job-platform results, automate platform actions, or store third-party search results.

---

## 📊 FEATURE 2: JOB TRACKER

### Adding Application
- Company Name
- Job Title
- Job URL (optional)
- Applied Date
- Status
- Notes

### Application Status Options
- 📝 Applied
- 👀 Viewed
- 📞 Interview Scheduled
- 💻 Technical Round
- 👔 HR Round
- ✅ Offer
- ❌ Rejected
- ⏸️ On Hold
- 🚫 Withdrawn

### Email Reminders (Optional)
- User can **choose to set a reminder** for any application
- User selects reminder time (24 hours before, 1 hour before, or custom)
- Email sent at the selected time via Resend
- Email includes: Company, Role, Time, Notes
- **Agenda.js persists all reminder jobs directly in MongoDB** — jobs automatically resume after any server restart, cold start, or crash with no manual re-scheduling code needed

### Dashboard Stats
- Total applications
- Applications this month
- **Interview Rate** — (Interview Scheduled + Technical Round + HR Round) ÷ Total Applications
- **Offer Rate** — Offers ÷ Total Applications
- **Rejection Rate** — Rejected ÷ Total Applications

---

## 🛠️ TECH STACK — Deep Dive

### 📦 Package Manager

**pnpm + Workspaces (Monorepo)**
A fast, disk-efficient package manager that uses hard links to save significant disk space. Using pnpm workspaces to manage both client and server in a single repository with shared scripts and unified dependency management.

### ⚛️ Frontend

**React 19 + React Compiler + Vite**
Latest React version for building the user interface. The React Compiler automatically optimizes rendering and memoization (eliminating the need for manual `useMemo`/`useCallback`). Vite ensures instant server start and lightning-fast builds using native ESM.

**TailwindCSS 4 + shadcn/ui**
Tailwind v4 offers a highly optimized engine for styling directly in HTML. shadcn/ui provides accessible, reusable components that I copy into the codebase for full control.

**React Router v7 (Library Mode) + TanStack Query**
React Router v7 is used in **library mode** — a pure client-side SPA with no Server-Side Rendering (SSR). This is the correct mode for this project because all server logic already lives in the separate Express backend; there is no need for React Router's framework mode (which adds SSR, bundling, and Remix-like data loading).
* **APIs used:** `createBrowserRouter` + `RouterProvider` — the same mental model as React Router v6 `createBrowserRouter`, with improved type safety in v7.
* **Why not framework mode?** Framework mode (React Router v7's "Remix mode") is designed for full-stack apps where the router also handles SSR and server actions. Since this project has a dedicated Express API, framework mode would add unnecessary complexity with zero benefit.
* **SPA routing note:** Vercel must be configured with a `vercel.json` rewrite rule to redirect all paths to `index.html`, which is standard for SPAs deployed on Vercel.

TanStack Query v5 automates data fetching, caching, background refetching, and server-state synchronization.

**TypeScript + React Hook Form + Zod + Axios**
TypeScript checks the application contracts at build time. React Hook Form manages complex forms with minimal re-renders, while Zod validates untrusted form and API data at runtime; types are inferred from Zod schemas where practical to avoid duplicate contracts. Axios handles HTTP requests with built-in interceptors.

**React Hot Toast**
Lightweight toast notification library for displaying success, error, and info messages. Simple API with beautiful default styling and full customization options.

**Phosphor Icons**
Flexible icon family with 6000+ icons in multiple weights (thin, light, regular, bold, fill). Provides consistent, high-quality icons for all UI elements.

### 🖥️ Backend

**Node.js + Express**
Event-driven architecture for running JS on the server. Express provides a minimal, flexible framework for building APIs and managing middleware.

**JWT + argon2**
Stateless authentication using secure JSON Web Tokens. argon2 is a memory-hard hashing algorithm significantly more secure than bcrypt against brute-force attacks.

**Multer + pdf-parse + Agenda.js**
Multer handles file uploads (using `diskStorage` to prevent Out-Of-Memory crashes under high concurrency by keeping heavy files out of RAM). Once parsed and uploaded to Cloudinary, the temporary file is deleted via `fs.unlink`. `pdf-parse` extracts text from resume PDFs for AI analysis, and `Agenda.js` schedules and persists automated email reminders directly in MongoDB.
* **Why pdf-parse over pdfjs-dist:** `pdfjs-dist` is Mozilla's full PDF rendering engine — designed for displaying PDFs in the browser. Using it on the server purely for text extraction is like using a graphics engine to read a text file: it works, but it carries unnecessary rendering complexity, a large bundle, and a more complex API. `pdf-parse` is a focused library built specifically for server-side text extraction from PDFs. It has a simpler API (`pdf(buffer).then(data => data.text)`), is significantly lighter, and does exactly what is needed here: extract raw text and send it to the AI model. No rendering pipeline, no canvas dependency, no browser-specific code.
* **Trade-off awareness:** `pdfjs-dist` gives fine-grained access to text coordinates, font data, and page layout — useful if the goal were PDF reconstruction or layout-aware parsing. For this project, plain text extraction is all that is needed, making `pdf-parse` the correct, simpler, and more maintainable choice.
* **TypeScript types:** `pdf-parse` is a plain JavaScript package and does not ship its own type definitions. Install `@types/pdf-parse` as a dev dependency (`pnpm add -D @types/pdf-parse`) so TypeScript understands the module's API and strict mode is satisfied without resorting to `any`.
* **Why Agenda.js over node-cron:** `node-cron` is an in-memory scheduler — if the server restarts (which Render's free tier does unpredictably), all scheduled jobs are lost even if you've stored their timestamps in MongoDB, because you'd need to manually re-hydrate and re-register every pending job on each boot. `Agenda.js` stores jobs *natively* in MongoDB — on restart it automatically picks up and re-schedules all pending jobs with zero manual recovery code. This is the architecturally correct solution for a server that may restart unexpectedly.

### 🤖 AI & Data

**Google Gemini 3.5 Flash API (Primary)**
Google's current-generation AI model — the primary provider for resume analysis.
* **Model identifier:** `gemini-3.5-flash` (use this exact string in API calls).
* **Free tier:** Available via [Google AI Studio](https://aistudio.google.com) for limited development and portfolio usage. Enforce application-level quotas and retry logic because provider limits can change.
* **Why Primary:** Rock-solid reliability (Google infrastructure), excellent structured JSON output, strong reasoning for resume analysis, free tier for portfolio scale.
* **Note:** Gemini 2.0 Flash was shut down on June 1, 2026 — do not use it.
* **Model lifecycle:** Gemini 2.5 Flash is scheduled for shutdown no earlier than October 16, 2026. This project uses the current stable `gemini-3.5-flash` model instead.

**Groq API (Fallback)**
Groq's fast inference engine running Qwen 3.6 27B — used as automatic fallback when Gemini is unavailable.
* **Model identifier:** `qwen/qwen3.6-27b`.
* **Free tier:** Available for limited portfolio usage. OpenAI-compatible API format.
* **Architecture:** `aiService.ts` tries Gemini 3.5 Flash first → if it fails/times out → automatically retries with Groq Qwen → returns result from whichever succeeds. Every provider response is treated as `unknown` and validated against a Zod schema before the typed result reaches the rest of the application.
* **Quota Protection:** An `express-rate-limit` window combined with Cloudflare Turnstile is heavily applied exclusively to the AI route. Authenticated users are limited (e.g., 5 requests per 15 mins), while Guest users must pass a Turnstile challenge and face strict IP-based limits to explicitly prevent scraping or bot abuse.
* **Dual-Failure Handling:** If both Gemini and Groq fail (downtime, rate-limited, or network error), the API returns a `503 Service Unavailable` with a user-friendly message: *"Our analysis service is temporarily unavailable. Please try again in a few minutes."* No partial or malformed data is ever returned to the client.

**MongoDB Atlas + Mongoose**
Database to save user data and stats.
* **Free:** 512MB storage is free forever (enough for 10,000+ users).
* **Paid:** Only if the app stores huge amounts of data.

### ☁️ Infrastructure

**Cloudinary**
Where the app saves profile photos and resume PDFs.
* **Free:** The platform gets 25GB of storage/bandwidth per month.
* **Paid:** Only if there are tons of HD images/videos.

**Resend SDK**
Resend is a developer-focused email delivery platform with an official Node.js SDK. Instead of configuring an SMTP transport (as you would with Nodemailer), you simply call `resend.emails.send({ from, to, subject, html })` — one function, no transport setup, no SMTP credentials to manage. This produces significantly cleaner code and removes an entire dependency from the project.
* **Free:** 3,000 emails per month (100 per day) — sufficient for portfolio scale.
* **Why Resend SDK over Nodemailer + Resend SMTP:** Nodemailer is an SMTP transport library — it was designed to talk to any SMTP server. Using it with Resend means writing SMTP configuration boilerplate (`createTransport`, host, port, auth) just to wrap a service that already has a clean REST API. The official Resend SDK removes all of that: authenticate with an API key, call one method, done. Less code, no SMTP config, and first-class TypeScript types out of the box.
* **Paid:** Only if the app sends more than 3,000 emails/month.

**Vercel + Render**
Where the website lives on the internet.
* **Vercel (Frontend):** Free for personal projects.
* **Render (Backend):** Free tier available (750 hours/month). The server automatically pauses to save resources after 15 minutes of inactivity (it wakes up automatically when a user visits).
* **Paid:** Only if 24/7 uptime without pausing is needed.

* **UptimeRobot**
Free monitoring service that pings the backend every 10 minutes to prevent sleeping.
* **Why:** Render's free tier pauses after 15 min of inactivity. This breaks scheduled cron jobs (email reminders). UptimeRobot keeps the server awake.
* **Free:** 50 monitors, 5-min intervals — more than enough for this project.

**Sentry**
Error monitoring and alerting for production. Catches unhandled errors, uncaught promise rejections, and API failures in real time.
* **Free:** 5,000 errors per month — more than enough for a portfolio project.
* **Why:** Without monitoring, production bugs go unnoticed. Sentry provides stack traces, breadcrumbs, and alerts so you can debug issues quickly.
* **Paid:** Only if the app generates more than 5K errors/month (unlikely).

**GitHub Actions (CI/CD)**
Automated pipeline that runs lint checks and tests on every push and pull request.
* **Free:** 2,000 minutes/month on free GitHub plan — more than enough.
* **Why:** Ensures code quality stays consistent. Prevents broken code from getting merged. Shows recruiters you follow professional development practices.
