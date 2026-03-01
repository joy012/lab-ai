# Product Requirements Document (PRD)

# AI Lab Report Interpreter — Healthcare Startup

**Version:** 1.0  
**Date:** March 2025  
**Status:** Draft

---

## Quick Reference (For Claude/AI Build)

Use this PRD when building the app. Key patterns:

- **Monorepo:** Turborepo + pnpm, `apps/mobile`, `apps/backend`, `libs/api-client`, `libs/email-templates`
- **API flow:** Backend Nestia → OpenAPI → Kubb → api-client. Never raw fetch in mobile.
- **Service pattern:** keys → invalidation → makeQuery/makeMutation → export. See §6.3.
- **Auth:** `createAuthPublicController` (no token) for login/register; `createAuthPrivateController` (with token) for me, profile, lab reports.
- **Reference:** inboxshop monorepo for `makeQuery`, `makeMutation`, `omitCommons`, service file structure.

---

## 1. Executive Summary

### 1.1 Product Vision

An AI-powered lab report interpreter that allows patients and doctors to upload lab report images, extract structured values via OCR, and receive AI-generated interpretations. Built **Bangladesh-first** with local lab formats and reference ranges, expandable internationally.

### 1.2 Core Value Proposition

- **Fast to build:** Upload image → OCR → extract values → AI interpretation (narrow scope)
- **Clear value:** Doctors and patients both need it
- **Works with free AI:** Structured extraction + simple interpretation (Gemini free tier)
- **MongoDB-friendly:** Documents per lab report, easy schema evolution
- **Future:** Voice-to-EHR once core is validated

### 1.3 AI Stack (Free Tier)

| Provider           | Free Tier                  | Models                           | Use Case                               |
| ------------------ | -------------------------- | -------------------------------- | -------------------------------------- |
| **Google Gemini**  | ~60 req/min, 1M tokens/day | gemini-1.5-flash, gemini-1.5-pro | Lab interpretation, Vision (images)    |
| **Ollama** (local) | $0                         | Llama 3.2 Vision                 | Offline/sensitive OCR + interpretation |

**Recommendation:** Gemini API during development; optionally Ollama for vision if zero-cost desired.

---

## 2. Tech Stack Overview

### 2.1 Monorepo Structure (Turborepo + pnpm)

```
<project-root>/
├── apps/
│   ├── mobile/          # React Native (Expo)
│   └── backend/         # NestJS
├── libs/
│   ├── api-client/      # Kubb-generated API client
│   └── email-templates/ # React Email templates
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── PRD-ai-lab-report-interpreter.md
```

### 2.2 Layer Choices

| Layer          | Technology                                                | Purpose                                       |
| -------------- | --------------------------------------------------------- | --------------------------------------------- |
| **Mobile**     | React Native + Expo                                       | Cross-platform iOS/Android                    |
| **Mobile UI**  | NativeWind + React Native Reusable (RN port of shadcn/ui) | Styling + component library                   |
| **Icons**      | lucide-react-native                                       | Consistent iconography                        |
| **Backend**    | NestJS + Nestia                                           | REST API, typed routes, Swagger               |
| **DB**         | MongoDB Atlas (M0 free)                                   | Document store for lab reports                |
| **ORM**        | Prisma (MongoDB provider)                                 | Type-safe DB access                           |
| **Realtime**   | Socket.io                                                 | Live updates (e.g., report processing status) |
| **Auth**       | bcrypt + JWT                                              | Password hashing, token-based auth            |
| **API Client** | Kubb                                                      | OpenAPI → TypeScript client generation        |
| **Email**      | React Email                                               | Reusable email templates                      |
| **API Docs**   | Nestia + Swagger or Scalar                                | OpenAPI spec for Kubb                         |

---

## 3. Monorepo Architecture

### 3.1 Package Manager & Workspace

- **pnpm** with workspace at root
- `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - apps/*
    - libs/*
  ```

### 3.2 Root package.json Scripts

```json
{
  "scripts": {
    "prepare": "pnpm run build:libs",
    "build:libs": "turbo run build build:gen typecheck --filter=./libs/*",
    "gen:api-client": "turbo run build:gen --filter=@<scope>/api-client",
    "gen:swagger": "pnpm --filter @<scope>/backend swagger:generate",
    "dev": "turbo run dev",
    "dev:mobile": "pnpm --filter @<scope>/mobile dev",
    "dev:backend": "pnpm --filter @<scope>/backend dev",
    "dev:email-playground": "pnpm --filter @<scope>/email-templates dev"
  }
}
```

### 3.3 Prepare Pipeline (pnpm prepare)

Runs on `pnpm install`. Order of operations:

1. **Backend:** `prisma generate` → Build Nestia → Emit OpenAPI JSON (`dist/openapi.json`)
2. **api-client:** Run Kubb against OpenAPI → Generate TypeScript client → Build
3. **email-templates:** Build + typecheck

**Note:** `prepare` may skip or fail if backend isn't built yet (e.g. first clone). Use `pnpm gen:api-client` after backend is ready.

---

## 4. Apps

### 4.1 Mobile App (`apps/mobile`)

#### 4.1.1 Tech Stack

- **Expo** (managed or bare workflow)
- **React Native**
- **NativeWind** (Tailwind for RN)
- **React Native Reusable** (shadcn-style components)
- **lucide-react-native** for icons
- **@tanstack/react-query** for data fetching
- **Expo Router** or React Navigation for routing

#### 4.1.2 Key Features (MVP)

- Auth: Register, Login, Forgot password, Verify email
- Upload lab report image (camera + gallery)
- View report list with processing status
- View extracted values and AI interpretation
- Realtime status updates (Socket)

#### 4.1.4 Token Storage (globalStoreBridge)

Mobile must provide a bridge for the API client to get/set tokens and handle logout. Wire `globalStoreBridge` to your auth store (e.g. Zustand + AsyncStorage):

```typescript
// apps/mobile/src/lib/api-client.ts
export const globalStoreBridge = {
  getAccessToken: () => authStore.getState().accessToken,
  getRefreshToken: () => authStore.getState().refreshToken,
  setAccessToken: (token) => authStore.getState().setAccessToken(token),
  onLogout: () => authStore.getState().logout(),
};
```

#### 4.1.5 API Integration Pattern (Same as inboxshop)

- Use `@<scope>/api-client` controllers
- `makeQuery` / `makeMutation` from shared `queryUtils`
- Service files: keys → invalidation map → queries → mutations → export
- **Auth:** `createAuthPublicController(publicRequestFunction)` for login/register
- **Auth:** `createAuthPrivateController(globalAuthRequestFunction)` for me, updateProfile
- **Lab reports:** `createLabReportsController(globalAuthRequestFunction)` for all lab report endpoints

---

### 4.2 Backend (`apps/backend`)

#### 4.2.1 Tech Stack

- **NestJS**
- **Nestia** (typed routes, Swagger/OpenAPI generation)
- **Prisma** (MongoDB)
- **bcrypt** for password hasashing
- **Socket.io** (or @nestjs/websockets) for realtime
- **@nestjs/jwt** for access/refresh tokens
- **Google Gemini** SDK for AI

#### 4.2.2 OpenAPI Generation

- Nestia emits Swagger/OpenAPI JSON during build
- Output path: `apps/backend/dist/openapi.json` (or similar)
- Optional: Scalar for interactive API docs

#### 4.2.3 Suggested Prisma Schema (Lab Report)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  passwordHash  String
  name          String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  labReports    LabReport[]
}

model LabReport {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  doctorId  String?  @db.ObjectId
  imageUrl  String
  rawText   String?  // OCR output
  values    Json     // [{ test: "Hb", value: 12.5, unit: "g/dL", status: "normal" }]
  summary   String?  // AI interpretation
  status    String   @default("PENDING") // PENDING | PROCESSING | COMPLETED | FAILED
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 5. Libs

### 5.1 API Client (`libs/api-client`)

#### 5.1.1 Generation Flow

1. Backend builds → Nestia emits `openapi.json`
2. Kubb reads `openapi.json`
3. Kubb generates:
   - TypeScript types (from OpenAPI schemas)
   - API client (fetch/axios-based)
   - Optional: React Query hooks (or custom `makeQuery`/`makeMutation`)

#### 5.1.2 Kubb Configuration (`libs/api-client/kubb.config.ts`)

```ts
import { defineConfig } from "@kubb/core";
import swaggerTs from "@kubb/swagger-ts";
import swaggerClient from "@kubb/swagger-client";

export default defineConfig({
  root: ".",
  input: {
    path: "../../apps/backend/dist/openapi.json",
  },
  output: {
    path: "./src/generated",
    clean: true,
  },
  plugins: [
    swaggerTs(),
    swaggerClient({
      client: {
        importPath: "./client",
        dataReturnType: "data",
      },
    }),
  ],
});
```

#### 5.1.3 Client Pattern (Auth vs Public)

Kubb generates clients that use a **custom client** (axios or fetch). Inject auth via:

- **Custom client with axios interceptor:** Add `Authorization: Bearer <token>` in request config; on 401, call refresh endpoint and retry.
- **`baseURL`:** Set via `pluginClient({ baseURL: process.env.EXPO_PUBLIC_API_URL })`.
- **Two clients:** One with auth interceptor (`globalAuthClient`) for private APIs; one without (`publicClient`) for login/register.

Example `libs/api-client/src/client.ts`:

```ts
import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com/v1";

export const publicClient = axios.create({ baseURL });

export const createAuthClient = (
  getToken: () => string | null,
  onLogout: () => void,
) => {
  const client = axios.create({ baseURL });
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  client.interceptors.response.use(
    (r) => r,
    async (err) => {
      if (err.response?.status === 401) {
        // Refresh token logic here; on failure call onLogout()
      }
      throw err;
    },
  );
  return client;
};
```

Kubb's `pluginClient({ importPath: './client' })` will use this. For public vs private controllers, either:

- Generate two clients in Kubb (via multiple plugin instances), or
- Pass the appropriate client when calling endpoints (manually wrap generated functions).

#### 5.1.4 Package Exports

```json
{
  "name": "@<scope>/api-client",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts",
    "build:gen": "pnpm run gen && pnpm run build",
    "gen": "kubb generate"
  }
}
```

---

### 5.2 Email Templates (`libs/email-templates`)

#### 5.2.1 Stack

- **React Email** for building components
- **@react-email/components** for primitives

#### 5.2.2 Structure

```
libs/email-templates/
├── src/
│   ├── templates/
│   │   ├── welcome.tsx
│   │   ├── verification.tsx
│   │   ├── password-reset.tsx
│   │   └── lab-report-ready.tsx
│   ├── index.ts
│   └── dummy-data.ts      # For playground
├── package.json
├── tsconfig.json
└── react-email.config.ts  # If needed
```

#### 5.2.3 Scripts

| Script      | Action                                                  |
| ----------- | ------------------------------------------------------- |
| `build`     | Compile templates, emit JS/HTML for backend consumption |
| `typecheck` | `tsc --noEmit`                                          |
| `dev`       | Start React Email dev server (playground)               |

#### 5.2.4 Playground

- Run `pnpm dev` in `libs/email-templates`
- Opens web UI with template preview and dummy data
- Use `dummy-data.ts` to pass mock props (user name, verification link, etc.)

#### 5.2.5 Build Output

- Backend imports templates via `@<scope>/email-templates`
- Use `render()` from React Email to produce HTML string for Nodemailer/Resend/SES

---

## 6. API Service Pattern (Mobile) — Inboxshop Alignment

### 6.1 Query Utils (`apps/mobile/src/utils/queryUtils.ts`)

```typescript
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

// Adapt to Kubb client return type (e.g. { data, error } or direct data)
type ApiResult<T> = { data?: T; error?: { message: string } } | T;

export const makeQuery = <TParams, TResponse>({
  queryFunction,
  queryKeyFactory,
}: {
  queryFunction: (params: TParams) => Promise<ApiResult<TResponse>>;
  queryKeyFactory: (params: NoInfer<TParams>) => unknown[];
}) => {
  return (params: TParams, queryOptions?: UseQueryOptions<TResponse>) => {
    return useQuery({
      queryKey: queryKeyFactory(params),
      queryFn: ({ signal }) =>
        queryFunction({ ...params, signal } as TParams).then((res) => {
          const data =
            typeof res === "object" && res && "data" in res ? res.data : res;
          const err =
            typeof res === "object" && res && "error" in res ? res.error : null;
          if (err) throw new Error(err.message || "Request failed");
          return data as TResponse;
        }),
      ...queryOptions,
    });
  };
};

export const makeMutation = <TVariables, TResponse>({
  mutationFunction,
  onSuccess,
}: {
  mutationFunction: (vars: TVariables) => Promise<ApiResult<TResponse>>;
  onSuccess?: (vars: TVariables, res: TResponse) => void;
}) => {
  return (opts?: UseMutationOptions<TResponse, Error, TVariables>) => {
    return useMutation({
      mutationFn: (vars) =>
        mutationFunction(vars).then((res) => {
          const data =
            typeof res === "object" && res && "data" in res ? res.data : res;
          const err =
            typeof res === "object" && res && "error" in res ? res.error : null;
          if (err) throw new Error(err.message || "Request failed");
          onSuccess?.(vars, data as TResponse);
          return data as TResponse;
        }),
      ...opts,
    });
  };
};
```

### 6.2 omitCommons

```typescript
export const omitCommons = (data: Record<string, unknown>) => {
  const { signal, headers, ...rest } = data;
  return rest;
};
```

### 6.3 Service File Structure (Lab Reports Example)

```typescript
// apps/mobile/src/services/lab-reports.service.ts
import { queryClient } from "@/utils/queryClient";
import { makeMutation, makeQuery } from "@/utils/queryUtils";
import { omitCommons } from "@/lib/api-client";
import { createLabReportsController } from "@<scope>/api-client";
import { globalAuthRequestFunction } from "@/lib/api-client";

const controller = createLabReportsController(globalAuthRequestFunction);

// ============ Keys ============
export const labReportServiceKeys = {
  base: "LAB_REPORT",
  list: (params: Parameters<typeof controller.list>[0]) => [
    labReportServiceKeys.base,
    "list",
    omitCommons(params),
  ],
  detail: (params: Parameters<typeof controller.getById>[0]) => [
    labReportServiceKeys.base,
    "detail",
    omitCommons(params),
  ],
};

// ============ Invalidation ============
export const invalidateLabReportQueries = {
  all: () =>
    queryClient.invalidateQueries({ queryKey: [labReportServiceKeys.base] }),
  list: (params: Parameters<typeof controller.list>[0]) =>
    queryClient.invalidateQueries({
      queryKey: labReportServiceKeys.list(params),
    }),
};

// ============ Queries ============
const useLabReports = makeQuery({
  queryFunction: controller.list,
  queryKeyFactory: (p) => labReportServiceKeys.list(p),
});

const useLabReport = makeQuery({
  queryFunction: controller.getById,
  queryKeyFactory: (p) => labReportServiceKeys.detail(p),
});

// ============ Mutations ============
const useUploadLabReport = makeMutation({
  mutationFunction: controller.upload,
  onSuccess: () => invalidateLabReportQueries.all(),
});

export const labReportsService = {
  useLabReports,
  useLabReport,
  useUploadLabReport,
};
```

### 6.4 Auth Service (Public vs Private)

```typescript
// apps/mobile/src/services/auth.service.ts
import {
  createAuthPublicController,
  createAuthPrivateController,
} from "@<scope>/api-client";
import { globalAuthRequestFunction } from "@/lib/api-client";
import { makeMutation, makeQuery } from "@/utils/queryUtils";

const publicCtrl = createAuthPublicController(globalAuthRequestFunction);
const privateCtrl = createAuthPrivateController(globalAuthRequestFunction);

export const authServiceKeys = { base: "AUTH", me: () => ["AUTH", "me"] };

const useMe = makeQuery({
  queryFunction: privateCtrl.me,
  queryKeyFactory: () => authServiceKeys.me(),
});

const useLogin = makeMutation({ mutationFunction: publicCtrl.login });
const useRegister = makeMutation({ mutationFunction: publicCtrl.register });
// ... etc
```

---

## 7. Build & Pipeline Commands

### 7.1 Root Commands

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `pnpm prepare`        | Runs after install: build libs, generate api-client   |
| `pnpm gen:api-client` | Backend build → Swagger → Kubb gen → api-client build |
| `pnpm dev`            | Run all dev servers (or filtered)                     |
| `pnpm build`          | Full workspace build                                  |

### 7.2 Turbo Configuration (turbo.json)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "dependsOn": ["^build", "typecheck"],
      "cache": false
    },
    "build:gen": {
      "outputs": ["dist/**", "src/generated/**"],
      "dependsOn": ["@<scope>/backend#build"],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "cache": false
    },
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```

### 7.3 api-client build:gen Dependency

- `libs/api-client` depends on `apps/backend` producing `openapi.json`
- In `build:gen`, backend must run `build` first
- Kubb reads `../../apps/backend/dist/openapi.json` (path relative to api-client)

---

## 8. API Client Generation Flow (Kubb + Nestia)

### 8.1 Sequence

1. **Backend:** `pnpm build` (or `nest build` + Nestia swagger)
   - Nestia emits OpenAPI during build or via `npx nestia swagger`
   - Output: `apps/backend/dist/openapi.json`

2. **api-client:** `pnpm run gen` (Kubb generate)
   - Reads `openapi.json`
   - Writes to `libs/api-client/src/generated/`

3. **api-client:** `pnpm run build` (tsup/bundler)
   - Bundles generated + manual client code
   - Output: `libs/api-client/dist/`

### 8.2 Frontend/Mobile Command

```bash
pnpm gen:api-client
```

Or at root:

```json
"gen:api-client": "turbo run build:gen --filter=@<scope>/api-client"
```

This always: build backend → emit swagger → run Kubb → build api-client.

---

## 9. Backend Auth (bcrypt)

- Hash passwords with **bcrypt** before storing in User model
- Use `bcrypt.hash(password, 10)` on register
- Use `bcrypt.compare(password, user.passwordHash)` on login
- Issue JWT access + refresh tokens
- Store refresh token (optional: in DB or signed cookie)

---

## 10. Realtime (Socket)

- Use **Socket.io** or `@nestjs/websockets` with Socket.io adapter
- Events to consider:
  - `lab-report:processing` — report ID, progress
  - `lab-report:completed` — report ID, values, summary
  - `lab-report:failed` — report ID, error
- Mobile connects with auth token (e.g. in handshake)
- Emit from backend when OCR/AI pipeline finishes

---

## 11. Email Templates Playground

- `libs/email-templates`: `pnpm dev` runs React Email dev server
- Browser shows template list with dummy data
- Edit `dummy-data.ts` to change preview props
- Backend imports `render(WelcomeEmail, { ... })` to send emails

---

## 12. Cost Breakdown (Reference)

| Phase              | Est. Monthly                                       |
| ------------------ | -------------------------------------------------- |
| **Building**       | ~$0 (Gemini free, MongoDB M0, Vercel/Railway free) |
| **First 1k users** | ~$20–80                                            |
| **10k+ users**     | ~$300–700                                          |

---

## 13. Implementation Phases

### Phase 1: Monorepo Setup

- [ ] pnpm workspace, Turborepo
- [ ] apps/backend (NestJS + Nestia + Prisma + MongoDB)
- [ ] apps/mobile (Expo scaffold)
- [ ] libs/api-client (Kubb config, manual client adapter)
- [ ] libs/email-templates (React Email, playground)
- [ ] Root prepare + gen:api-client

### Phase 2: Backend Core

- [ ] User model, auth (register, login, bcrypt)
- [ ] JWT access/refresh
- [ ] LabReport model, CRUD
- [ ] Nestia controllers, Swagger output
- [ ] Health/readiness endpoints

### Phase 3: AI Pipeline

- [ ] Image upload (S3 or local)
- [ ] Gemini Vision for OCR/extraction
- [ ] Structured output (values array)
- [ ] Gemini for summary interpretation
- [ ] Background job or queue for async processing

### Phase 4: API Client & Mobile

- [ ] Kubb gen from OpenAPI
- [ ] makeQuery/makeMutation, omitCommons
- [ ] Auth service, lab reports service
- [ ] Mobile screens: auth, upload, list, detail
- [ ] Socket integration for status

### Phase 5: Email & Polish

- [ ] Welcome, verification, password reset templates
- [ ] Backend email sending (Nodemailer/Resend)
- [ ] Bangladesh reference ranges (initial dataset)
- [ ] i18n (en, bn) if needed

---

## 14. Naming Conventions

| Scope              | Example                                        |
| ------------------ | ---------------------------------------------- |
| Package scope      | `@labreport` or `@health-ai`                   |
| API version prefix | `/v1/...`                                      |
| Controller naming  | `AuthPublicController`, `LabReportsController` |
| Service naming     | `authService`, `labReportsService`             |
| Query keys         | `authServiceKeys`, `labReportServiceKeys`      |

---

## 15. Appendix: Inboxshop Reference Summary

The mobile app will mirror the **inboxshop** (ezcart) pattern:

1. **API client:** Controllers created with `createXController(requestFn)` where `requestFn` is either:
   - `globalAuthRequestFunction` — adds Bearer token, handles refresh
   - `publicRequestFunction` — no auth (login, register, etc.)

2. **Service structure:**
   - Keys object (base + param-based)
   - Invalidation map (all, by params)
   - makeQuery for reads
   - makeMutation for writes, with onSuccess invalidation
   - Export service object

3. **No raw fetch/useQuery/useMutation** — always go through api-client + makeQuery/makeMutation

4. **Types** — Import from `@<scope>/api-client`

5. **Imperative calls** — `const ctrl = createLabReportsController(fn); await ctrl.upload(...)`

---

_End of PRD_
