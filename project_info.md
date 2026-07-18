# AI-Powered Resume Analysis & Job Tracking System

> Built for the **OpenAI Codex Hackathon**.

> **Status:** 🚀 Complete & Production-Ready

An all-in-one AI-powered platform that helps candidates improve their resumes and manage their job search in a simple, organized way. It combines AI resume analysis with job application tracking so users can move from preparation to follow-up in one place.

---

## 🧑‍💻 CORE FEATURES

### Quick Overview

|  | Feature | Description |
|---|---------|-------------|
| 1 | **AI-Powered Resume Checker** | Upload PDF, paste JD/role, AI analysis, Match Verdict, Suggestions, Interview Questions + Google Dorks |
| 2 | **Job Tracker** | Track applications across 6 status stages, view funnel analytics, and schedule persistent reminders |

---

## 🧑‍💻 TECHNICAL HIGHLIGHTS

This project goes beyond a typical MERN stack application. Here are the key differentiators:

| Feature | Technology | What It Does |
|---------|------------|--------------|
| **AI Integration** | Google Gemini 3.5 Flash + Groq API | Intelligent resume analysis with AI provider fallback for reliability |
| **Type Safety** | TypeScript (strict mode) + Zod | Compile-time contracts plus runtime validation at every untrusted boundary |
| **System Design** | Scalable Architecture | Modular folder structure, clean code patterns, and database design best practices |
| **Performance & Cost** | SHA-256 Caching | Hashes inputs to bypass redundant API calls, dropping latency from ~5s down to ~50ms and saving free-tier tokens |
| **Web Security** | Helmet.js, Zod, JWT | Security headers, robust validation, XSS prevention |
| **Observability** | Winston Structured Logging | Captures detailed insights into auth failures, token lifecycle, and critical API flows without exposing sensitive data |

---

## 🛠️ TECH STACK

### Quick Overview

| Category | Technologies |
|---|---|
| **Language** | TypeScript (strict mode) across the client and server |
| **Frontend** | TypeScript, React 19, React Compiler, Vite, TailwindCSS 4, shadcn/ui, React Router v7 (library mode), TanStack Query, Axios, React Hook Form, Zod, React Hot Toast, Phosphor Icons |
| **Backend** | TypeScript, Node.js, Express, JWT, argon2, Multer, pdf-parse, Agenda.js |
| **Testing** | Vitest, React Testing Library (Frontend), Supertest (Backend API) |
| **AI** | Google Gemini 3.5 Flash API free tier (primary) + Groq API free tier (fallback) |
| **Database** | MongoDB Atlas + Mongoose (ODM) |
| **Storage** | Cloudinary |
| **Email** | Nodemailer + Gmail |
| **Hosting** | Vercel (Frontend), Render (Backend), UptimeRobot (Keep-Alive) |
| **Monitoring** | Sentry (Free: 5K errors/month) |
| **CI/CD** | GitHub Actions (lint + test on push) |

---

## 🔐 FOUNDATION: USER AUTHENTICATION & PROFILE

### Signup Options

**Email + Password**
User enters Name, Email, Password. Account created. Verification email sent. After verification → Main landing page.

**Google Login**
One-click signup/login using `@react-oauth/google` on the frontend and `google-auth-library` on the backend for ID token verification.

### Structured Auth Logging (Observability)
To ensure the authentication system is fully observable and debuggable in production, structured logging (via Winston) tracks critical flows without exposing sensitive data:
- **Login Attempts:** Logs successful logins and failures.
- **Token Lifecycle:** Logs access token generation, refresh token usage, and token expirations.
- **Security Violations:** Logs unauthorized access to protected routes and missing/invalid JWTs.

---

## 👤 FOUNDATION: PROFILE MANAGEMENT

After signup or login, users can manage their profile:

### Profile Settings
- **Update Name** — Change display name anytime
- **Upload Profile Image** — Upload or change profile picture (JPG/PNG, max 2MB)
- **Change Email** — Update email address (requires verification)
- **Password Management** — Change password (only for email/password accounts)

---

## 📄 FEATURE 1: AI-POWERED RESUME CHECKER

### How It Works
1. User uploads resume **(PDF only, max 5MB)**
2. User enters optional job details (paste a job description, or describe the role they are looking for).
3. **Caching Check (Performance/Cost Optimization):** The backend generates a SHA-256 hash of the extracted resume text + job description + search preferences. It checks MongoDB:
   - *If an identical hash exists* → Instantly returns the previous analysis results (~50ms, Free).
   - *If no match* → Proceeds to the AI API.
4. AI analyzes the resume using Gemini 3.5 Flash API with Groq Qwen 3.6 27B as an automatic fallback.
5. Analysis results are **saved to the database** — users can view their past analyses anytime.

### Analysis Results

**Overall Resume Verdict**
- 🟢 **Strong Match** — "Your resume aligns well with this role"
- 🟡 **Partial Match** — "Some gaps need attention"
- 🔴 **Weak Match** — "Significant improvements are needed"

**Sub-feature 1: Resume Analysis**
- **Missing Skills/Keywords** — Skills or keywords from the job description that are not present in the resume
- **What's Working** — Specific strengths that align with the role
- **Improvement Suggestions** — Actionable recommendations

**Sub-feature 2: AI Interview Question Generator**
- Generates between **10 and 50** personalized interview questions (default 30).
- Questions cover experience, tech stack, and behavioral topics.

**Sub-feature 3: Google Dorks Generator (Advanced Search Queries)**
- Based on the resume and job preferences, generates exactly **15 high-quality Google search queries**.
- Strict distribution: **8 job-search queries**, **4 interview preparation queries**, and **3 interview experience queries**.
- Queries target company career pages, LinkedIn, GitHub repositories, and forums using Google operators (`site:`, `"exact phrase"`, `after:`).

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
The system strictly tracks applications across 6 granular states:
- 📝 Applied
- 📞 Interview
- ✅ Offer
- ❌ Rejected
- ⏸️ On Hold
- 🚫 Withdrawn

### Email Reminders
- User can set a reminder for any application (24 hours before, 1 hour before, or custom time).
- **Agenda.js persists all reminder jobs directly in MongoDB** — jobs automatically resume after any server restart or crash with no manual re-scheduling code needed.

### Dashboard Stats
- A responsive analytics chart visualizes the total application funnel across all 6 statuses, plus the total number of active scheduled reminders.

---

## 🛠️ TECH STACK — Deep Dive

### 📦 Package Manager
**pnpm + Workspaces (Monorepo)**
A fast, disk-efficient package manager that uses hard links to save significant disk space. Uses workspaces to manage client and server with unified tooling.

### ⚛️ Frontend
**React 19 + React Compiler + Vite**
Latest React version with the new compiler for automatic memoization. Vite ensures instant server start and fast builds.

**React Router v7 (Library Mode) + TanStack Query**
Pure SPA client-side routing decoupled from the backend. TanStack Query v5 handles data fetching and caching.

### 🖥️ Backend
**Node.js + Express**
Event-driven server architecture.

**JWT + argon2**
Stateless authentication using secure JSON Web Tokens. argon2 provides highly secure password hashing.

**Multer + pdf-parse + Agenda.js**
Multer handles file uploads via diskStorage. `pdf-parse` extracts text efficiently without a full rendering engine. `Agenda.js` provides robust cron job persistence in MongoDB.

### 🤖 AI & Data
**Google Gemini 3.5 Flash API (Primary) + Groq API (Fallback)**
Implements an automatic fallback pattern. Every AI response is treated as `unknown` and strictly validated against Zod schemas before being used.

### ☁️ Infrastructure
Hosted entirely on free-tier infrastructure using **Vercel** (frontend) and **Render** (backend), supported by **UptimeRobot** for keep-alives, **Cloudinary** for storage, **Nodemailer/Gmail** for emails, and **Sentry** for error tracking.
