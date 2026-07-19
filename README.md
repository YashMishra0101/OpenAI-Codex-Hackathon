<div align="center">

# CodexAI - AI Resume Analysis & Job Tracking System

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white&style=for-the-badge)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=black&style=for-the-badge)](https://render.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/Managed_with-pnpm-F69220?logo=pnpm&logoColor=white&style=for-the-badge)](https://pnpm.io/)
<br/>
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-8B5CF6?logo=turborepo&logoColor=white&style=for-the-badge)](https://pnpm.io/workspaces)
[![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white&style=for-the-badge)](https://github.com/features/actions)
[![Sentry](https://img.shields.io/badge/Monitoring-Sentry-362D59?logo=sentry&logoColor=white&style=for-the-badge)](https://sentry.io/)
<br/>
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
<br/>
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](./LICENSE)
[![Gemini AI](https://img.shields.io/badge/Gemini_3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter_Llama_3.3-362D59?style=for-the-badge&logo=openrouter&logoColor=white)](https://openrouter.ai/)

> This project is created using Codex for the **OpenAI Codex Hackathon**.
>
> The OpenAI Codex Hackathon is hosted on [namasteDev.com](https://namastedev.com) and organized by **Akshay Saini**.

</div>

---

## 🧐 The Problem

Job seekers today juggle multiple **disconnected tools**, one for **resume feedback** and another for **tracking job applications**. This platform brings AI-driven resume feedback, interview preparation, and application tracking into one unified workflow.

## 💡 The Solution

This platform brings everything together:

- **Upload your resume** → Get instant AI-powered Match Analysis, keyword analysis, personalized interview questions, and Google Dorks (advanced search queries) that help you discover relevant job postings across the web.
- **Track your applications** → Monitor status, set email reminders, and view application funnel analytics.

---

## ✨ Core Features

### 📄 AI-Powered Resume Analyzer

Upload your resume (PDF) and optionally paste a job description — the AI returns a full structured analysis:

> **Note:** If analysis fails, please try 2-3 times. Most times it works in 2-3 attempts.

| Section                                    | What You Get                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Match Analysis**                         | Strong / Partial / Weak verdict with missing keywords & strengths                                    |
| **Key Strengths**                          | Brief explanations of the key strengths identified during the resume analysis                        |
| **Areas for Improvement**                  | Actionable, specific tips to strengthen your resume                                                  |
| **Interview Questions**                    | 10–50 personalized questions based on your resume + JD (generates 30 by default, customizable later) |
| **Advanced Search Queries (Google Dorks)** | 15 highly targeted queries (8 job search, 4 interview prep, 3 interview experiences)                 |
| **Analysis History**                       | All past analyses saved — revisit anytime                                                            |
| **Works without JD**                       | Analyze your resume on its own, no job description required                                          |

**What are Google Dorks?** Advanced search queries using operators like `site:`, `"exact phrase"`, and `after:` to surface results normal searches miss. The AI generates these targeted queries from your resume and job preferences so you discover relevant opportunities faster.

---

### 📊 Job Application Tracker

Keep every application organized in one powerful dashboard:

- Track company, role, status, applied date, job URL, and notes
- **7 granular status stages:**

  | Status          | Icon |
  | --------------- | ---- |
  | Applied         | 📝   |
  | Interview       | 📞   |
  | Offer           | ✅   |
  | Rejected        | ❌   |
  | On Hold         | ⏸️   |
  | Withdrawn       | 🚫   |
  | Email Reminders | ⏰   |

- **Dashboard stats** — visually tracks your application funnel across all 7 statuses, plus total active reminders.

---

### 🔐 Authentication

- **Email/Password** signup with email verification (re-send supported)
- **Google OAuth 2.0** — via `@react-oauth/google` (frontend) + `google-auth-library` (backend token verification)

---

### 👤 User Profile

- Update name, email, and password
- Upload / change profile picture (JPG/PNG, max 2MB, stored on Cloudinary)

---

## 🛠️ Tech Stack

> This project goes well beyond a typical MERN stack application.

| Layer               | Technologies                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Language**        | TypeScript in strict mode across the client and server                                                                                                                   |
| **Frontend**        | TypeScript, React 19, React Compiler, Vite 8, TailwindCSS 4, shadcn/ui, React Router v7, TanStack Query v5, React Hook Form, Zod, Axios, React Hot Toast, Phosphor Icons |
| **Backend**         | TypeScript, Node.js, Express, JWT (Access + Refresh tokens), argon2, Multer, pdf-parse, Agenda.js                                                                        |
| **AI**              | Google Gemini Free Tier (`gemini-3.1-flash-lite` & others) — Primary · OpenRouter Llama 3.3 70B Instruct free tier (`meta-llama/llama-3.3-70b-instruct:free`) — Fallback |
| **Database**        | MongoDB Atlas + Mongoose (ODM)                                                                                                                                           |
| **Storage**         | Cloudinary (profile images + resume PDFs)                                                                                                                                |
| **Email**           | Nodemailer + Gmail (500 emails/day free)                                                                                                                                 |
| **Testing**         | Vitest · React Testing Library · Supertest                                                                                                                               |
| **Monitoring**      | Sentry (5K errors/month free), Winston structured logging                                                                                                                |
| **CI/CD**           | GitHub Actions (lint + test on every push)                                                                                                                               |
| **Hosting**         | Vercel (Frontend) · Render (Backend) · UptimeRobot (keep-alive pings)                                                                                                    |
| **Package Manager** | pnpm Workspaces (Monorepo)                                                                                                                                               |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React SPA)                   │
│  TypeScript (strict) · Vite · React 19 · TailwindCSS 4    │
│    React Router v7 (library mode) · TanStack Query v5       │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express API)                    │
│       TypeScript (strict) · Node.js · JWT · Helmet.js · Zod │
│                    Multer · Agenda.js                       │
│                  Route → Controller → Service → Model       │
│                     (API versioned at /api/v1/)             │
└────┬─────────────┬────────────────┬────────────────┬────────┘
     │             │                │                │
     ▼             ▼                ▼                ▼
MongoDB         Gemini 3.5      Cloudinary        Nodemailer
Atlas           Flash API       (Storage)         (Gmail)
(Primary DB)    + OpenRouter Llama 3.3
                (AI Fallback)
```

---

## 🔒 Security

Production-level security practices implemented throughout:

| Practice            | Implementation                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Password Hashing    | **argon2** (memory-hard, stronger than bcrypt)                                                   |
| Session Management  | **JWT** with HttpOnly cookies (prevents XSS token theft)                                         |
| Token Strategy      | **Access + Refresh token** rotation                                                              |
| Type & Input Safety | **TypeScript** compile-time checking plus **Zod** runtime schemas on every route and AI response |
| Security Headers    | **Helmet.js** configured for production                                                          |
| File Safety         | **Multer** type/size restrictions (PDF only, max 5MB)                                            |
| Observability       | **Winston** structured auth logging — no passwords or tokens ever logged                         |

---

## ⚙️ Key Engineering Decisions

<details>
<summary><strong>🧠 Why SHA-256 Caching for AI Responses?</strong></summary>

Calling the Gemini 3.5 Flash API consumes a limited free-tier quota and takes time. If two users submit the same resume + job description, making two separate API calls is wasteful.

Before every AI call, the backend generates a `SHA-256` hash of `(resumeText + jobDescription)`. It first queries MongoDB for an existing record with that hash. If found → instant response (~50ms, zero cost). If not → call the AI, store the result with the hash for future reuse.

**Result:** Latency drops from ~5s → ~50ms for cache hits. Free-tier tokens are preserved.

</details>

<details>
<summary><strong>⏰ Why Agenda.js over node-cron for Email Reminders?</strong></summary>

`node-cron` is an in-memory scheduler — if the server restarts (Render's free tier does this after 15 min of inactivity), all scheduled jobs are **permanently lost**. You'd need to manually re-hydrate pending jobs from MongoDB on every boot.

`Agenda.js` stores jobs **natively in MongoDB**. On any restart, it automatically reconnects and resumes all pending reminders — zero manual recovery code needed. This is the architecturally correct choice for a server that restarts unpredictably.

</details>

<details>
<summary><strong>🤖 Why Dual AI Providers (Gemini + OpenRouter)?</strong></summary>

The backend implements an **automatic fallback pattern** for AI providers to maximize reliability since both services are operating on their free tiers.

When analyzing a resume, it attempts to use these models in the following order:

1. `gemini-3.1-flash-lite` (Primary)
2. `gemini-3.1-flash-image`
3. `gemini-2.0-flash-lite`
4. `gemini-2.0-flash`
5. If all Gemini models fail, it falls back to OpenRouter's `meta-llama/llama-3.3-70b-instruct:free`.

**Rate Limit Handling:** Because both Gemini and OpenRouter are free tier models, they have strict per-minute usage limits. To prevent our server from being blocked for exceeding these upstream limits, we have configured a strict rate limit in our backend (Express) that ensures users cannot send more requests than our free AI providers can handle.

Both provider responses are validated with Zod and normalized to one inferred TypeScript contract, so the rest of the application is unaware of which provider was used.

</details>

<details>
<summary><strong>📄 Why pdf-parse over pdfjs-dist?</strong></summary>

`pdfjs-dist` is Mozilla's full PDF **rendering engine** — designed to display PDFs visually in the browser. Using it on the server to extract text is like using a graphics engine to read a text file: it works, but carries unnecessary rendering complexity, a large bundle size, and browser-specific code.

`pdf-parse` is a lightweight, focused library built specifically for server-side text extraction. API: `pdf(buffer).then(data => data.text)` — one line, exactly what's needed. No rendering pipeline, no canvas dependency.

</details>

<details>
<summary><strong>🔑 Why React Router v7 in Library Mode (Not Framework Mode)?</strong></summary>

React Router v7's framework mode (the "Remix mode") handles SSR, bundling, and server actions — great for full-stack apps where the router is also the server. This project has a **dedicated Express backend** that already handles all business logic and database access.

Using library mode (`createBrowserRouter` + `RouterProvider`) gives robust client-side routing as a pure SPA while keeping the frontend strictly decoupled from the backend. TypeScript provides compile-time checking for the application code; routing itself does not make runtime input safe. Framework mode would add SSR complexity with zero benefit.

</details>

<details>
<summary><strong>📦 Why pnpm Workspaces for a Monorepo?</strong></summary>

`pnpm` uses a **global content store with hard links** — packages are stored once and referenced everywhere, instead of being duplicated per project like npm/yarn. This saves significant disk space and speeds up installs.

`pnpm` also enforces a **strict non-flat node_modules** structure, preventing phantom dependencies — a common hidden-bug source with npm/yarn's flat structure where you can accidentally use packages you never explicitly declared.

The monorepo setup lets `client/` and `server/` share a single Git repo, unified scripts, and consistent tooling (ESLint, Prettier) without duplicating config.

</details>

---

## 🧪 Testing Strategy

| Layer               | Tool                           | Coverage                                          |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| Backend API         | Supertest                      | Auth flow, resume upload, job CRUD                |
| Frontend Components | Vitest + React Testing Library | Form validation, protected routes, key components |

---

## 🧑‍💻 Deployment

| Service            | Purpose                       | Free Tier                                |
| ------------------ | ----------------------------- | ---------------------------------------- |
| **Vercel**         | Frontend hosting (React SPA)  | Unlimited personal projects              |
| **Render**         | Backend hosting (Express API) | 750 hrs/month (sleeps after 15 min idle) |
| **UptimeRobot**    | Keep-alive pings every 10 min | 50 monitors free                         |
| **MongoDB Atlas**  | Database                      | 512 MB forever free                      |
| **Cloudinary**     | Media storage & CDN           | 25 GB/month free                         |
| **Nodemailer**     | Email delivery                | 500 emails/day free via Gmail            |
| **Sentry**         | Error monitoring              | 5,000 errors/month free                  |
| **GitHub Actions** | CI/CD pipeline                | 2,000 min/month free                     |

> UptimeRobot pings the `/health` endpoint every 10 minutes, keeping Render awake so Agenda.js scheduled email reminders never miss a beat.
>
> **Note:** This entire platform is built and deployed using 100% free-tier resources, keeping the running cost at $0/month.

---

## Attribution

If you fork, clone, or build upon this project, please credit the original author:

**Yash Mishra** — [GitHub](https://github.com/YashMishra0101) · [Original Repository](https://github.com/YashMishra0101/AI-Resume-Analysis-Job-Tracking-System)

---

## 👨‍💻 About & Connect

I'm actively open to **Software Engineering** and **Full Stack Developer** roles. If you're a recruiter or founder looking for an engineer who ships complete, resilient, and user-focused products — let's talk.

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/YashMishra0101)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/yash-mishra-356280223/)
[![X](https://img.shields.io/badge/X-000000?logo=x&logoColor=white&style=for-the-badge)](https://x.com/YashRKMishra1)

</div>

---

<div align="center">
  <i>Built with passion for learning, job preparation and pushing the boundaries of what a portfolio project can be.</i>
  <br/><br/>
  <i> If this project inspires you, give it a star ⭐</i>
</div>
