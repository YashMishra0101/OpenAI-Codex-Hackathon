# 📁 Folder Structure

An industry-standard, scalable folder structure for both frontend and backend.

---

## Project Root Structure

```
ai-resume-job-tracker/          # TypeScript-first pnpm monorepo
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI (lint + test on push)
├── client/                  # Frontend (React + Vite + TypeScript)
├── server/                  # Backend (Express + TypeScript)
├── .gitignore
├── README.md
├── LICENSE
├── package.json             # Root monorepo scripts (concurrently dev, lint all, etc.)
└── pnpm-workspace.yaml      # pnpm workspaces config
```

---

## 🎨 Frontend Structure (client/)

```
client/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── assets/              # Static files (images, fonts)
│   │   └── images/
│   │
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── common/          # App-wide reusable components
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── authApi.ts
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       └── SignupPage.tsx
│   │   │
│   │   ├── resume-checker/  # AI-Powered Resume Checker feature
│   │   │   ├── components/
│   │   │   │   ├── OverallVerdict.tsx       # Strong / Partial / Weak top summary
│   │   │   │   ├── ResumeAnalysis.tsx       # Strengths and actionable improvements
│   │   │   │   ├── InterviewQuestions.tsx    # 10–50 question list and count selector
│   │   │   │   └── SearchQueryList.tsx       # Copy/open advanced Google search queries
│   │   │   ├── hooks/
│   │   │   │   └── useResumeAnalysis.ts
│   │   │   ├── schemas/
│   │   │   │   └── resumeAnalysisSchema.ts   # Zod response schema and inferred client type
│   │   │   ├── services/
│   │   │   │   └── resumeApi.ts
│   │   │   └── pages/
│   │   │
│   │   ├── job-tracker/     # Job Tracker feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── pages/
│   │   │
│   │   └── profile/         # Profile management feature
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── pages/
│   │
│   ├── hooks/               # Global custom hooks
│   │   └── useLocalStorage.ts
│   │
│   ├── lib/                 # Utilities and configurations
│   │   ├── axios.ts         # Axios instance with interceptors
│   │   ├── queryClient.ts   # TanStack Query client
│   │   └── utils.ts         # Helper functions
│   │
│   ├── routes/              # Route definitions (React Router v7 — library mode, SPA)
│   │   ├── index.tsx        # createBrowserRouter + RouterProvider (no SSR, pure client-side)
│   │   └── ProtectedRoute.tsx  # Auth guard — redirects unauthenticated users to /login
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css
│   │
│   ├── __tests__/           # Frontend tests
│   │   ├── components/      # Component tests
│   │   │   └── LoginForm.test.tsx
│   │   └── hooks/           # Hook tests
│   │       └── useAuth.test.ts
│   │
│   ├── test/                # Test utilities
│   │   └── setup.ts         # Vitest setup (cleanup, mocks)
│   │
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
│
├── .env.example
├── eslint.config.js
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json            # Strict compiler settings for client code
├── vite.config.ts
└── vercel.json              # SPA rewrite — redirects all paths to index.html
```

### Why This Frontend Structure?

| Decision | Reason |
|----------|--------|
| **Feature-based folders** | Scales better than type-based (components/, pages/). Each feature is self-contained. |
| **ui/ for shadcn** | Official recommendation. Components are copied, not imported from node_modules. |
| **services/ per feature** | API calls stay close to the feature that uses them. Easier to find and maintain. |
| **lib/ for config** | Central place for axios, query client, utilities. Import once, use everywhere. |
| **hooks/ per feature + global** | Feature-specific hooks stay local. Shared hooks go global. |
| **__tests__/ centralized** | Tests mirror src/ structure. Easy to find tests for any component or hook. |

### TypeScript Contract Rules

- `tsconfig.json` uses `strict: true`; `allowJs` stays disabled so new application code cannot silently fall back to JavaScript.
- Use `.tsx` only for files that contain JSX; all other application files use `.ts`.
- The server uses ESM with `module` and `moduleResolution` set to `NodeNext`. Therefore, server-to-server imports use a `.js` specifier (for example, `./app.js`) even though the source file is `app.ts`; `tsc` emits that JavaScript file into `dist/`.
- Type external data as `unknown` until Zod validates it. This includes request bodies, `process.env`, and every AI-provider response.
- Infer types from the Zod schema (`z.infer<typeof schema>`) when the schema is the source of truth. Do not duplicate the same shape as an unrelated interface.
- Do not use `any`, blanket type assertions, or `@ts-ignore` to suppress errors. Narrow the value or model the contract instead.
- `eslint.config.js` is tooling configuration and may remain JavaScript; all application and test source is TypeScript.

---

## 🖥️ Backend Structure (server/)

```
server/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.ts            # MongoDB connection
│   │   ├── cloudinary.ts    # Cloudinary config
│   │   ├── oauth.ts         # Google OAuth config (google-auth-library — ID token verification)
│   │   ├── sentry.ts        # Sentry error monitoring config
│   │   ├── gemini.ts        # Gemini 3.5 Flash API config (primary AI)
│   │   ├── groq.ts          # Groq API config (fallback AI — model: qwen/qwen3.6-27b)
│   │   └── env.ts           # Environment variable validation
│   │
│   ├── constants/           # App-wide constants
│   │   ├── httpStatus.ts    # HTTP status codes
│   │   └── messages.ts      # Error/success messages
│   │
│   ├── controllers/         # Route handlers (thin layer)
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── resumeController.ts
│   │   └── jobController.ts
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.ts          # JWT verification
│   │   ├── errorHandler.ts  # Global error handler
│   │   ├── validate.ts      # Zod validation middleware
│   │   ├── upload.ts        # Multer configuration
│   │   └── rateLimiter.ts   # Rate limiting
│   │
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Resume.ts          # Saved verdict, analysis, questions, and generated search-query metadata
│   │   └── JobApplication.ts
│   │
│   ├── routes/              # API routes
│   │   ├── index.ts         # Route aggregator
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── resumeRoutes.ts
│   │   └── jobRoutes.ts
│   │
│   ├── services/            # Business logic layer
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── resumeService.ts
│   │   ├── jobService.ts
│   │   ├── aiService.ts     # AI logic (Gemini 3.5 Flash primary + Groq Qwen 3.6 27B fallback)
│   │   └── emailService.ts  # Email sending
│   │
│   ├── utils/               # Helper functions
│   │   ├── logger.ts        # Winston or custom logger
│   │   ├── ApiError.ts      # Custom error class
│   │   ├── ApiResponse.ts   # Standard response format
│   │   └── asyncHandler.ts  # Try-catch wrapper
│   │
│   ├── validations/         # Zod schemas
│   │   ├── authValidation.ts
│   │   ├── userValidation.ts
│   │   ├── resumeValidation.ts # Resume input plus validated AI-output contract
│   │   └── jobValidation.ts
│   │
│   ├── jobs/                # Scheduled tasks
│   │   └── reminderJobs.ts  # Agenda.js job definitions for email reminders
│   │
│   └── app.ts               # Express app setup
│
├── __tests__/               # Backend tests
│   ├── integration/         # API endpoint tests
│   │   ├── auth.test.ts     # Auth routes (register, login, logout)
│   │   ├── resume.test.ts   # Resume analysis endpoints
│   │   └── job.test.ts      # Job tracker CRUD endpoints
│   └── unit/                # Service/util unit tests
│       ├── authService.test.ts
│       └── aiService.test.ts
│
├── scripts/
│   └── seed.ts              # Database seed script (demo data for dev/testing)
│
├── .env.example
├── eslint.config.js
├── package.json
├── tsconfig.json            # Strict compiler settings; compiles src/ to dist/
└── server.ts                # Entry point (starts server; compiled before production start)
```

### Why This Backend Structure?

| Decision | Reason |
|----------|--------|
| **services/ layer** | Business logic is separate from controllers. Controllers stay thin. Testable. |
| **validations/ with Zod** | Validation schemas are reusable; Zod validates runtime input and inferred TypeScript types keep application contracts aligned. |
| **utils/ for helpers** | Common patterns (asyncHandler, ApiError) reduce repetition. |
| **config/ centralized** | All external service configs in one place. Easy to manage. |
| **constants/** | Magic strings/numbers become named constants. Self-documenting code. |
| **__tests__/ with integration + unit** | Integration tests hit real API routes with Supertest. Unit tests verify service logic in isolation. |
| **scripts/seed.ts** | Populates database with realistic demo data for development and demo videos. Keeps seed logic out of app code. |
| **config/sentry.ts** | Centralized error monitoring setup. Catches unhandled errors in production. |

---

## 🔑 Key Architecture Decisions

### 1. Controller → Service → Model Pattern

```
Route                Controller               Service               Model
──────────────────────────────────────────────────────────────────────────
POST /login    →     authController.login()  →  authService.login()  →  User.find()
                     (handles request/response)  (business logic)      (database)
```

**Why?**
- Controllers stay thin (just handle HTTP)
- Services are testable without Express
- Easy to swap database later

### 2. Feature-Based Frontend vs Type-Based

```
❌ Type-Based (Doesn't Scale)     ✅ Feature-Based (Scales Well)
├── components/                   ├── features/
│   ├── LoginForm.tsx            │   ├── auth/
│   ├── SignupForm.tsx           │   │   ├── components/
│   ├── ResumeUpload.tsx         │   │   ├── services/
│   ├── JobCard.tsx              │   │   └── pages/
│   └── ... 50 more files        │   ├── resume-checker/
├── pages/                        │   └── job-tracker/
└── services/                     
```

**Why Feature-Based?**
- Related code stays together
- Easy to find files for a feature
- Can delete entire feature folder cleanly
- Common in large codebases (Meta, Google)

### 3. Environment Variable Validation

```ts
// server/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... more variables
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
```

**Why?**
- App fails fast if env vars are missing
- Runtime validation plus typed access for environment variables
- Self-documenting required configuration

---

## 📋 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase with "use" prefix | `useAuth.ts` |
| Services | camelCase | `authService.ts` |
| Utilities | camelCase | `asyncHandler.ts` |
| Routes | camelCase | `authRoutes.ts` |
| Models | PascalCase (singular) | `User.ts` |

---

## ⚠️ Critical Production Gotchas

> These three items are not "optional polish." Missing any one of them will cause hard-to-debug failures in production. They must be implemented from Day 1.

---

### Gotcha 1 — CORS Must Be Configured with `credentials: true`

**What is CORS?**
Cross-Origin Resource Sharing (CORS) is a browser security mechanism. When your React frontend (running on `https://your-app.vercel.app`) makes an HTTP request to your Express backend (running on `https://your-api.onrender.com`), the browser blocks it by default because the two origins are different. CORS headers tell the browser: "This backend explicitly allows requests from this frontend."

**Why `credentials: true` is mandatory for this project:**
This project uses HttpOnly cookies to store JWT tokens. HttpOnly cookies are automatically attached to every request the browser makes — but *only if* both the frontend and backend explicitly allow it:

- **Backend:** `cors({ credentials: true })` — tells Express to include `Access-Control-Allow-Credentials: true` in every response header
- **Frontend (Axios):** `withCredentials: true` on the Axios instance — tells the browser to attach cookies to cross-origin requests

If you forget either side, the browser silently drops the cookie and every authenticated request will fail with 401. This is one of the most common and frustrating production debugging experiences for developers.

**Implementation location:** `server/src/app.ts` (must be registered BEFORE any routes)

```ts
// server/src/app.ts
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',                          // Vite dev server
  process.env.CLIENT_URL,                           // Vercel production URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
      }
    },
    credentials: true,           // MANDATORY — allows HttpOnly cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

**Frontend Axios instance must also include `withCredentials`:**

```ts
// client/src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // MANDATORY — attaches HttpOnly cookies to every request
});

export default api;
```

**Express middleware order in `app.ts` (order matters):**
```
1. helmet()          ← Security headers first
2. cors()            ← Must come before routes
3. express.json()    ← Body parsing
4. express.urlencoded({ extended: true })
5. /api/v1/ routes   ← Business logic
6. errorHandler      ← ALWAYS last
```

---

### Gotcha 2 — `env.ts` Zod Validation Must Run Before Everything Else

**What is this?**
`server/src/config/env.ts` uses Zod to validate all environment variables at startup. If a required variable like `MONGODB_URI` or `JWT_SECRET` is missing, Zod throws immediately.

**The problem:** Zod's `.parse()` is synchronous and throws. If your app tries to call `connectDB()` before `env.ts` is imported, the app will crash with a confusing MongoDB connection error instead of a clear "missing env variable" message.

**The fix — mandatory call order in `server/server.ts`:**

```ts
// server/server.ts  ← Entry point
// Step 1: Validate ALL env vars first — fails fast with a clear error if any are missing.
// This import executes envSchema.parse(process.env) immediately.
import './src/config/env.js';

// Step 2: Now safe to import everything else — env vars are guaranteed to exist.
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';

const startServer = async () => {
  await connectDB();                    // Step 3: Connect DB (env vars already validated)
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer();
```

**Why `.parse()` over `.safeParse()`:**
`.parse()` throws on failure — the app crashes immediately with a Zod error listing *exactly* which variable is missing. This is the correct behavior at startup. `.safeParse()` returns `{ success: false, error }` without throwing — useful inside functions, not at module-level startup.

**Interview Answer:** "I use Zod to validate all environment variables at application startup, before the database connection or any route registration. This implements the 'fail fast' principle — if a critical configuration is missing, the app crashes immediately with a descriptive error rather than failing silently at runtime when the missing variable is first used. This makes misconfigured deployments immediately obvious instead of causing mysterious bugs hours later."

---

### Gotcha 3 — `client/vercel.json` SPA Rewrite Rule

**What is this and why does it matter?**
React Router v7 in library mode is a **Single-Page Application (SPA)**. The routing is entirely handled in JavaScript in the browser. The server (Vercel) only serves one file: `index.html`.

**The problem:** When a user visits `https://your-app.vercel.app/dashboard` directly (typed in browser, shared link, page refresh), Vercel's static file server tries to find a file at `dist/dashboard/index.html`. That file does not exist. Vercel returns a `404 Not Found`.

**Why it doesn't happen in local dev:** Vite's dev server automatically handles this — it serves `index.html` for any route it doesn't recognize.

**The fix — `client/vercel.json`:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**What this does:** Tells Vercel: "For any URL that doesn't match a static file, serve `index.html` instead." The browser then loads React, React Router reads the URL path, and renders the correct component. The user never sees a 404.

**File location:** `client/vercel.json` (at the root of the `client/` workspace, next to `package.json`)

**Common mistake:** Placing `vercel.json` at the monorepo root instead of inside `client/`. When deploying only the `client/` workspace to Vercel, Vercel only reads the `vercel.json` inside the deployed directory.

**Vercel deployment config (Vercel dashboard settings for the frontend):**
```
Root Directory:    client
Build Command:     pnpm run build
Output Directory:  dist
Install Command:   pnpm install
```

**Interview Answer:** "Because this is a React SPA using client-side routing, all routes are handled by JavaScript in the browser — not by the server. Without the Vercel rewrite rule, any direct URL visit or page refresh on a non-root route would return a 404 because no actual file exists at that path on the server. The rewrite rule tells Vercel to always serve `index.html`, which loads the React app, which then reads the URL and renders the correct page."

---

*This structure scales from MVP to 50+ features without major refactoring.*
