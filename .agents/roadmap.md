# 📅 22-Phase Execution Plan

> **Duration:** 22 days · 5 hours/day

> **TypeScript preparation:** 5–7 days (20–30 focused hours) before the 22 implementation phases
>
> **Daily Commitment:** 5 hours/day
> **Total Estimated Hours:** ~103–105 hours
> **Logic:** Original 15-phase plan had tasks totaling 6–9 hrs/day. This plan splits only the heavy days and keeps easy days compact. No artificial padding.

> **TypeScript decision:** This is a TypeScript-first build. Complete the preparation phase below before Phase 1; every application file created from Phase 1 onward uses `.ts` or `.tsx` with `strict: true`. Do not build a JavaScript version or schedule a later migration.

---

## Preparation Phase — TypeScript Fundamentals (5–7 days, 20–30 focused hours)

This is learning time before the 22 implementation phases, not a replacement for project work. The target is practical fluency, not advanced type-level programming.

| Topic | Outcome |
|------|---------|
| Types, interfaces, function signatures, arrays, objects | Model component props, service inputs, and API results |
| Unions, literal types, optional properties, narrowing | Model job statuses and handle nullable/external data safely |
| `unknown` vs `any` | Treat uploads, API data, and AI output as untrusted until validated |
| Generics and async return types | Understand Express, Axios, React Query, and utility contracts |
| Zod inference (`z.infer`) | Derive application types from runtime validation schemas without duplication |
| Tooling | Read TypeScript compiler errors, use strict mode, and run `typecheck` |

**Exit criterion:** You can create a strict TypeScript React/Node project, explain why TypeScript and Zod solve different problems, and fix basic compiler errors without using `any` or `@ts-ignore`.

---

## Phase 1 — Project Foundation

### What We Do
| Task | Time |
|------|------|
| Initialize TypeScript folder structure (frontend + backend) | 1 hr |
| Setup pnpm workspaces | 30 min |
| Configure TypeScript (`strict: true`), type-aware ESLint + Prettier, and `typecheck` scripts | 1 hr |
| Setup environment variables structure | 30 min |
| Create base Express server + React app in `.ts`/`.tsx` | 1 hr |
| Setup Vite 8 TypeScript template with React Compiler plugin | 30 min |
| Initialize Git with proper .gitignore | 30 min |

**Total: ~5 hrs** ✅

### Why This Order
Before writing any feature code, we need a **professional development environment**. In interviews, recruiters ask about your dev workflow—this is your answer.

### Learning Focus
- Monorepo vs separate repos (trade-offs)
- Why ESLint + Prettier together
- TypeScript compiler vs ESLint; why strict mode is enabled from the first commit
- `.ts` versus `.tsx`; why tooling config may remain JavaScript
- React Compiler auto-memoization vs manual useMemo
- Environment variable best practices

---

## Phase 2 — Database & Core Backend

### What We Do
| Task | Time |
|------|------|
| Setup MongoDB Atlas cluster | 30 min |
| Create Mongoose connection with retry logic | 1 hr |
| Design typed User Mongoose schema with proper indexing | 1.5 hr |
| Setup error handling middleware | 1 hr |
| Create logger utility | 30 min |
| Setup Helmet.js with security headers | 30 min |
| Setup API versioned route structure (`/api/v1/` prefix + route aggregator) | 30 min |

**Total: ~5.5 hrs** ✅ *(push slightly — this is foundational)*

### Why This Order
Database and error handling are **foundation layers**. Every feature builds on these. Getting them wrong means rewriting later.

### Learning Focus
- MongoDB indexing strategies
- Mongoose document types and why they do not validate external input
- Express error handling patterns
- Production logging practices

---

## Phase 3 — Auth Backend Part 1: Routes + JWT + Cookies

> **Split from original Phase 3** (was 8.5 hrs total — split into Phase 3 + Phase 4)

### What We Do
| Task | Time |
|------|------|
| Create auth routes (register, login, logout) | 2 hr |
| Implement JWT with typed access + refresh token payloads | 2 hr |
| Setup HttpOnly cookie handling | 1 hr |

**Total: ~5 hrs** ✅

### Why This Order
The JWT + refresh token pattern is the most conceptually complex part of auth. Give it full focus before adding validation on top.

### Learning Focus
- JWT internals (header, payload, signature)
- Access token vs refresh token — why two tokens?
- Keep request `user` augmentation and JWT claims explicit instead of using `any`
- Why HttpOnly cookies prevent XSS attacks

---

## Phase 4 — Auth Backend Part 2: Validation + Email Verify + Logging

> **Continuation of original Phase 3**

### What We Do
| Task | Time |
|------|------|
| Add Zod input validation and infer request DTO types from schemas | 1 hr |
| Email verification backend (token generation, verification endpoint, resend logic) | 1.5 hr |
| Implement structured auth logging (Winston) for logins, token errors, unauthorized access | 1 hr |

**Total: ~3.5 hrs** *(shorter day — use remaining time to test your Phase 3 endpoints with Postman/Thunder Client)*

### Learning Focus
- Zod vs Joi vs manual validation
- Compile-time TypeScript checks vs runtime Zod validation
- Email token expiry and resend logic patterns
- Production observability — what to log vs what NOT to log (no passwords, no raw tokens)

> [!TIP]
> 📱 **Post this on LinkedIn/Twitter:** "Phase 4: Implemented JWT authentication with refresh tokens + email verification. Here's why HttpOnly cookies are crucial for security..."

---

## Phase 5 — Auth Frontend Part 1: UI + React Hook Form + Axios Start

> **Split from original Phase 4** (was 8.25 hrs total — split into Phase 5 + Phase 6)

### What We Do
| Task | Time |
|------|------|
| Setup Vite path alias (`@`) for shadcn/ui | 15 min |
| Create login/signup UI with shadcn/ui | 2 hr |
| Implement typed auth forms with React Hook Form + Zod resolver | 1.5 hr |
| Start setup of axios interceptors for token refresh | 1 hr |

**Total: ~4.75 hrs** ✅

### Learning Focus
- React Hook Form performance benefits (no re-renders on every keystroke)
- shadcn/ui copy-paste model vs npm import
- Controlled vs uncontrolled form inputs
- Infer form values from Zod schemas rather than maintaining duplicate interfaces

---

## Phase 6 — Auth Frontend Part 2: Axios + Google OAuth + Email Verify UI

> **Continuation of original Phase 4**

### What We Do
| Task | Time |
|------|------|
| Complete axios interceptors for token refresh | 30 min |
| Add Google OAuth via `@react-oauth/google` (frontend) + `google-auth-library` (backend) | 1 hr |
| Integrate Google login button in UI | 1 hr |
| Email verification UI (verify link page, token expiry handling, resend button) | 1 hr |

**Total: ~3.5 hrs** *(shorter day — use remaining time to test the full auth flow end-to-end)*

### Learning Focus
- Axios interceptors: how they silently refresh tokens on 401 responses
- OAuth 2.0 flow — why `@react-oauth/google` + `google-auth-library` over Passport.js

---

## Phase 7 — Profile Management + Cloudinary

### What We Do
| Task | Time |
|------|------|
| Profile update routes (name, email, password) | 1.5 hr |
| Multer setup for file uploads (diskStorage + temp file cleanup) | 1 hr |
| Cloudinary integration | 1 hr |
| Profile picture upload/update flow | 1.5 hr |
| Profile UI components | 1 hr |

**Total: ~6 hrs** *(1 hr over — but this is a straightforward feature, push through it)*

### Learning Focus
- Multer diskStorage vs memoryStorage — why disk prevents OOM crashes
- Cloud storage vs local storage trade-offs
- `fs.unlink` temp file cleanup after Cloudinary upload

---

## Phase 8 — AI Backend Part 1: PDF + Gemini + Groq + Fallback + Cache

> **Split from original Phase 6** (was 9.5 hrs — the heaviest day — split into Phase 8 + Phase 9)

### What We Do
| Task | Time |
|------|------|
| PDF upload endpoint with pdf-parse plus optional search-preference input | 1.5 hr |
| Gemini 3.5 Flash API integration setup — model: `gemini-3.5-flash` (primary free tier) | 1 hr |
| Groq API integration setup — model: `qwen/qwen3.6-27b` (fallback free tier) | 45 min |
| Build typed AI fallback pattern in `aiService.ts` (Gemini → Groq automatic failover) | 45 min |
| Implement SHA-256 caching layer (resume text + JD + search preferences) | 1 hr |

**Total: ~5 hrs** ✅

### Learning Focus
- Why pdf-parse over pdfjs-dist for server-side text extraction
- AI fallback pattern: try/catch around primary → catch calls fallback → both normalize to same response shape
- SHA-256 hashing for cost-efficiency: ~5s API call → ~50ms cache hit

> [!TIP]
> 📱 **Post this on LinkedIn/Twitter:** "Phase 8: Integrated Gemini 3.5 Flash + Groq Qwen 3.6 27B fallback. Also built SHA-256 caching to cut redundant API calls to near zero..."

---

## Phase 9 — AI Backend Part 2: Prompt Design + Response Parsing + Rate Limiting

> **Continuation of original Phase 6**

### What We Do
| Task | Time |
|------|------|
| Design structured AI output: top verdict, analysis, questions, and advanced search queries | 2 hr |
| Treat provider output as `unknown`; validate the full Zod contract, including query count/category rules | 1.5 hr |
| Rate limiting setup (express-rate-limit: Tiered Auth vs Guest IP limits) | 1 hr |

**Total: ~4.5 hrs** ✅

### Learning Focus
- Prompt engineering basics — forcing structured JSON output consistently
- API response parsing strategies — handling partial or malformed AI responses
- LLM output is untrusted: TypeScript checks code contracts, while Zod validates the real provider response
- Advanced search query generation: return query text only; never scrape results or automate third-party platforms
- Tiered rate limiting: authenticated users (5 req/15min) vs guest strict IP limits

---

## Phase 10 — AI Frontend Part 1: Upload UI + JD Input + Match Analysis Display

> **Split from original Phase 7** (was 6.5 hrs — split into Phase 10 + Phase 11)

### What We Do
| Task | Time |
|------|------|
| File upload UI with drag-and-drop | 1.5 hr |
| Job description input component (with optional skip) | 1 hr |
| Analysis loading state with skeleton | 30 min |
| Top-level Overall Resume Verdict display (Strong / Partial / Weak) plus Resume Analysis | 1.5 hr |

**Total: ~4.5 hrs** ✅

### Learning Focus
- TanStack Query mutations for file uploads
- Optimistic UI updates
- Skeleton loading patterns for AI features (sets user expectations during long waits)

---

## Phase 11 — AI Frontend Part 2 + Analysis History

> **Combines original Phase 7 remainder + Phase 8 Part A**

### What We Do
| Task | Time |
|------|------|
| Improvement Suggestions section | 1 hr |
| Interview Questions section (10–50 questions with count selector) | 1 hr |
| Advanced Search Query Generator: show 8 job, 1 learning, and 1 interview-experience query; copy/open actions | 1 hr |
| Generate 5 more query action (hard cap 15; preserve 80/20 category split) | 30 min |
| Analysis history page (list all past analyses) | 2 hr |

**Total: ~5.5 hrs** *(split this day if needed; the query UI must be useful, not a list of repetitive links)*

### Learning Focus
- TanStack Query: how `useQuery` caches and background-refetches data
- Pagination vs infinite scroll for analysis history list
- Copy-to-clipboard feedback, opening external links safely, and preventing repetitive query output

---

## Phase 12 — AI Polish: Detail View + Edge Cases + Error Boundaries

> **Continuation of original Phase 8**

### What We Do
| Task | Time |
|------|------|
| Individual analysis detail view | 1.5 hr |
| Edge case handling (empty PDF, large files, API failures, malformed or duplicate search queries) | 1.5 hr |
| Loading states, error boundaries, and UX polish | 1 hr |

**Total: ~4 hrs** *(shorter day — slow down here, quality matters more than speed)*

### Why This Phase Exists
The AI checker is your **flagship feature**. A polished, error-safe UI is the difference between "functional" and "impressive." Every recruiter will click this first.

### Learning Focus
- React Error Boundary pattern
- Graceful API failure handling — what to show when AI is down
- Error messages that don't expose internal server details
- Why the application generates advanced search queries but never scrapes Google or job platforms

---

## Phase 13 — Job Tracker Part 1: Data Model + Secure API

### What We Do
| Task | Time |
|------|------|
| Design `JobApplication` schema, status union, indexes, and ownership rules | 1 hr |
| Build validated create/read/update/delete API routes | 2 hr |
| Implement server-side dashboard-stat aggregations | 1 hr |
| Add service/API tests for ownership and valid status transitions | 1 hr |

**Total: ~5 hrs** ✅

### Learning Focus
- Index design for application history and dashboard queries
- Server-side ownership enforcement — users can only read and modify their own applications
- Status state machines and validation at API boundaries

---

## Phase 14 — Job Tracker Part 2: Forms + Application List

### What We Do
| Task | Time |
|------|------|
| Build typed create/edit application form with React Hook Form + Zod | 1.5 hr |
| Build application list, status filters, and empty/loading/error states | 2 hr |
| Add edit/delete flows with deliberate confirmation and TanStack Query invalidation | 1 hr |
| Connect dashboard-stat API query and summary cards | 30 min |

**Total: ~5 hrs** ✅

### Learning Focus
- React Hook Form + Zod inferred form values
- Query invalidation after a mutation; optimistic updates only where rollback is clear
- Safe delete UX and accessible confirmation dialogs

---

## Phase 15 — Job Tracker Part 3: Dashboard + Polish

> **Continuation of original Phase 10**

### What We Do
| Task | Time |
|------|------|
| Add status-board or timeline view for applications | 1.5 hr |
| Build accessible dashboard charts (optional — Chart.js or Recharts) | 1 hr |
| Refine status transitions, mobile layout, and error recovery | 1.5 hr |

**Total: ~4 hrs**

### Learning Focus
- Dashboard design patterns and honest empty states
- Status state machine — valid transitions between application statuses
- MongoDB aggregation for stats cards

---

## Phase 16 — Email Reminders + Guest Mode

### What We Do
| Task | Time |
|------|------|
| Agenda.js setup — connect to MongoDB, define job types | 1 hr |
| Resend SDK integration (direct API key, no SMTP config) | 1 hr |
| Reminder email templates | 1 hr |
| Store reminder jobs in MongoDB via Agenda.js (auto-resumes on restart) | 30 min |
| Verify job persistence — restart server and confirm pending reminders re-fire | 30 min |
| Guest mode implementation (IP tracking for strict AI rate limits) | 1 hr |

**Total: ~5 hrs** ✅

### Learning Focus
- Why Agenda.js over node-cron: MongoDB-native persistence survives Render's free tier restarts
- Resend SDK vs Nodemailer + SMTP — one function call vs full transport config
- Feature flags for guest mode

---

## Phase 17 — Testing Part 1: Backend API Tests (Supertest)

> **Split from original Phase 12** (was 7.5 hrs — split into Phase 17 + Phase 18)

### What We Do
| Task | Time |
|------|------|
| Add server `typecheck` to the local quality gate; fix compiler errors before writing tests | 30 min |
| Backend API tests with Supertest — auth flow (register → login → refresh → logout) | 1.5 hr |
| Supertest — resume upload + analysis endpoint | 1 hr |
| Supertest — job CRUD operations | 1 hr |
| Edge case and error path testing | 1 hr |

**Total: ~4.5 hrs** ✅

### Test Targets
- **Backend (Supertest):** Auth flow (register → login → refresh → logout), resume upload + analysis endpoint, job CRUD operations

### Learning Focus
- Integration tests vs unit tests — when to use each
- Mocking external services (Gemini API, Cloudinary) in tests
- Test database setup — using a separate test MongoDB instance

---

## Phase 18 — Testing Part 2: Frontend Tests + Seed Script

> **Continuation of original Phase 12**

### What We Do
| Task | Time |
|------|------|
| Frontend component tests with Vitest + React Testing Library | 2 hr |
| Key targets: LoginForm validation, protected route redirects, component rendering | — |
| Create database seed script (dummy users, resumes, job applications for dev/demo) | 1 hr |

**Total: ~3 hrs** *(shorter day — use remaining time to run all tests and fix any failures)*

### Test Targets
- **Frontend (Vitest + RTL):** Login/Signup form validation, protected route redirects, key component rendering

---

## Phase 19 — Bug Fixes + Responsive Design + Accessibility + Performance

### What We Do
| Task | Time |
|------|------|
| Fix bugs discovered during testing | 2 hr |
| Responsive design pass (mobile, tablet, desktop) | 1.5 hr |
| Accessibility improvements (aria labels, keyboard nav) | 1 hr |
| Verify AI fallback works end-to-end (simulate Gemini failure, confirm Groq fires) | 30 min |
| Performance optimization (React.lazy, code splitting, lazy loading) | 30 min |

**Total: ~5.5 hrs** *(slight over — bugs always take longer than expected)*

### Learning Focus
- Lighthouse performance audit — what to look for
- React.lazy and Suspense for code splitting
- ARIA attributes that actually matter vs over-engineering

---

## Phase 20 — Deploy Part 1: Vercel + Render + Monitoring Setup

> **Split from original Phase 14** (was 7 hrs — split into Phase 20 + Phase 21)

### What We Do
| Task | Time |
|------|------|
| Deploy frontend to Vercel | 1 hr |
| Deploy backend to Render | 1.5 hr |
| Setup UptimeRobot (keeps backend awake for Agenda.js scheduled jobs) | 15 min |
| Add GET /health endpoint for UptimeRobot | 15 min |
| Configure all environment variables on hosting platforms | 30 min |
| Integrate Sentry for error monitoring (free tier: 5K errors/month) | 30 min |

**Total: ~4 hrs** ✅

### Learning Focus
- CORS configuration for production domain
- MongoDB Atlas IP whitelist — why 0.0.0.0/0 for Render (dynamic IPs)
- Why UptimeRobot is critical for Agenda.js on free Render tier

---

## Phase 21 — Deploy Part 2: CI/CD + Production Testing + Bug Fixes

> **Continuation of original Phase 14**

### What We Do
| Task | Time |
|------|------|
| Setup GitHub Actions CI (`typecheck` + lint + test on push) | 30 min |
| Test all features on production (including email reminders) | 1.5 hr |
| Fix production-specific bugs | 1 hr |

**Total: ~3 hrs** *(shorter day — production bugs are unpredictable, keep buffer)*

### Deployment Checklist
- [ ] All env variables set on hosting platforms
- [ ] CORS configured for production domain
- [ ] MongoDB Atlas IP whitelist updated
- [ ] UptimeRobot configured (ping GET /health every 10 min to keep Render awake)
- [ ] Sentry DSN configured in both frontend and backend env
- [ ] GitHub Actions workflow passing (`typecheck`, lint, and tests green)
- [ ] Test all features on production (including email reminders)

### Learning Focus
- CI/CD basics with GitHub Actions; a typecheck is a separate quality gate from linting and tests
- Debugging production vs development differences
- Error monitoring with Sentry — reading stack traces in production

---

## Phase 22 — Documentation, Demo & Launch

### What We Do
| Task | Time |
|------|------|
| Update README with live demo links, features, tech stack, screenshots | 1 hr |
| Record demo video (walkthrough of all features) | 1.5 hr |
| Final code cleanup and comments | 1 hr |
| Write LinkedIn/Twitter launch post | 30 min |
| Final production smoke test | 30 min |

**Total: ~4.5 hrs** ✅

### Why This Phase Exists
Documentation and presentation are what make your project **stand out to recruiters**. A great README + demo video converts profile views into interview calls.

> [!TIP]
> 📱 **Post this on LinkedIn/Twitter:** "🚀 Just shipped my AI-Powered Resume Analyzer! MERN + Gemini 3.5 Flash + Groq Qwen 3.6 27B fallback. 22 days. 5 hrs/day. Here's what I learned: [link]"

---

## ⏰ Full 22-Phase Summary

| Phase | Hours | Focus Area |
|-----|-------|------------|
| 1 | 5 hrs | Project Setup |
| 2 | 5.5 hrs | Database & Core Backend |
| 3 | 5 hrs | Auth Backend — Routes + JWT + Cookies |
| 4 | 3.5 hrs | Auth Backend — Zod + Email Verify + Logging |
| 5 | 4.75 hrs | Auth Frontend — UI + React Hook Form |
| 6 | 3.5 hrs | Auth Frontend — Axios + Google OAuth + Email Verify UI |
| 7 | 6 hrs | Profile Management + Cloudinary |
| 8 | 5 hrs | AI Backend — PDF + Gemini + Groq + Cache |
| 9 | 4.5 hrs | AI Backend — Prompt Design + Parsing + Rate Limiting |
| 10 | 4.5 hrs | AI Frontend — Upload UI + Match Analysis Display |
| 11 | 5.5 hrs | AI Frontend — Suggestions + Interview Qs + Advanced Search + History |
| 12 | 4 hrs | AI Polish — Detail View + Edge Cases + Error Boundaries |
| 13 | 5 hrs | Job Tracker — Data Model + Secure API |
| 14 | 5 hrs | Job Tracker — Forms + Application List |
| 15 | 4 hrs | Job Tracker — Dashboard + Polish |
| 16 | 5 hrs | Email Reminders + Guest Mode |
| 17 | 4.5 hrs | Testing — Backend API (Supertest) |
| 18 | 3 hrs | Testing — Frontend (Vitest + RTL) + Seed Script |
| 19 | 5.5 hrs | Bug Fixes + Responsive + Accessibility + Performance |
| 20 | 4 hrs | Deploy — Vercel + Render + Sentry + UptimeRobot |
| 21 | 3 hrs | Deploy — GitHub Actions CI + Prod Testing + Fixes |
| 22 | 4.5 hrs | Documentation + Demo Video + Launch |

**Total: ~103–105 hours** 🎯

---

## 📱 LinkedIn/Twitter Post Schedule

| Post | Phase | Post Topic |
|------|-----|------------|
| Post 1 | Phase 1 | "Starting a 22-day MERN build challenge at 5h/day. Here's the full project I'm building..." |
| Post 2 | Phase 4 | JWT + refresh tokens + HttpOnly cookies — security explainer + why HttpOnly prevents XSS |
| Post 3 | Phase 7 | "Integrated Cloudinary for file uploads. Here's why I used Multer diskStorage instead of memoryStorage to prevent OOM crashes..." |
| Post 4 | Phase 8 | Gemini 3.5 Flash + Groq Qwen 3.6 27B fallback integration + SHA-256 caching — how I cut API usage to near zero |
| Post 5 | Phase 12 | AI Resume Checker deep-dive + demo GIF — the flagship feature is live |
| Post 6 | Phase 16 | "The AI Resume Checker and Job Tracker are complete. Now wiring up persistent email reminders with Agenda.js..." |
| Post 7 | Phase 22 | 🚀 Shipped! Full deployment announcement with live demo link + what I learned in 22 days |

---

*Phases 4, 6, 11, 12, 15, 18, 21 are intentionally shorter — this gives you natural buffer for unexpected blockers, debugging, or rest. The plan is front-loaded with the hardest work (auth, AI backend) so the final week feels manageable.*
