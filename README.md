# LabAI - AI-Powered Lab Report Interpreter

LabAI is a mobile-first application that uses AI to extract, interpret, and explain medical lab reports. Designed for both patients and doctors in Bangladesh, it turns complex lab reports into understandable health insights.

## What It Does

1. **Upload lab reports** - Take a photo, pick from gallery, or upload PDFs of lab reports
2. **AI extracts values** - Gemini Vision OCR reads every test value, reference range, and lab name
3. **Smart interpretation** - AI analyzes results and provides diagnosis, risk assessment, and recommendations
4. **Role-based reports** - Doctors get clinical terminology with differential diagnosis; patients get friendly, simple explanations
5. **Bangla support** - Diagnosis and summary available in both English and Bengali

## Key Features

- **Deterministic risk scoring** - Risk scores and diagnosis severity are computed server-side, not by AI, so they're consistent every time
- **Multi-file upload** - Upload up to 10 images/PDFs per report
- **Image lightbox** - Tap report images for fullscreen view with pinch-to-zoom
- **Real-time processing** - Socket.io progress updates during AI analysis
- **PDF export** - Download analyzed reports as PDF
- **Report comparison** - Compare two reports side-by-side
- **Health trends** - Track test values across multiple reports over time
- **Email notifications** - Get notified when analysis is complete or critical values are found
- **Dark mode** - Full theme support

## Tech Stack

### Apps

| App | Tech | Description |
|-----|------|-------------|
| `apps/mobile` | Expo (React Native) | iOS/Android mobile app |
| `apps/backend` | NestJS | REST API + WebSocket server |
| `apps/web` | Next.js | Web dashboard (WIP) |

### Shared Libraries

| Package | Description |
|---------|-------------|
| `libs/api-client` | Type-safe API client with React Query hooks |
| `libs/email-templates` | React Email templates |

### AI & Infrastructure

- **Gemini 2.5 Flash/Pro** - Lab report OCR + interpretation (with automatic fallback)
- **Groq (Llama 3.3)** - Fallback for text-only interpretation
- **MongoDB** - Database (via Prisma)
- **Cloudinary** - Image/PDF storage
- **Socket.io** - Real-time processing updates

## Project Structure

```
lab-report-app/
  apps/
    mobile/          # Expo React Native app
    backend/         # NestJS API server
    web/             # Next.js web app
  libs/
    api-client/      # Shared API client + types
    email-templates/ # Email templates
  packages/
    eslint-config/   # Shared ESLint config
    typescript-config/ # Shared TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)

### Setup

```bash
# Install dependencies
pnpm install

# Copy env template and fill in your keys
cp apps/backend/env.yaml.example apps/backend/env.yaml

# Push database schema
cd apps/backend && npx prisma db push

# Start development
pnpm dev
```

### Environment Variables

See `apps/backend/env.yaml.example` for all required variables:
- **GEMINI_API_KEY** - Get free at [aistudio.google.com](https://aistudio.google.com/apikey)
- **GROQ_API_KEY** - Get free at [console.groq.com](https://console.groq.com)
- **CLOUDINARY** - Get free at [cloudinary.com](https://cloudinary.com)
- **MongoDB** - Local or [MongoDB Atlas](https://cloud.mongodb.com) free tier

## Architecture

```
Mobile App  -->  NestJS API  -->  Gemini AI (OCR + Interpretation)
    |                |                    |
    |           MongoDB              Groq (fallback)
    |                |
    +-- Socket.io ---+  (real-time progress)
```

**Processing flow:**
1. User uploads images/PDFs
2. Backend saves to Cloudinary, creates report record
3. Gemini Vision extracts all lab values via OCR
4. Server normalizes values (lowercase status, validate ranges)
5. Server computes risk score + diagnosis severity (deterministic)
6. AI generates diagnosis text, summary, recommendations (role-based)
7. Results saved to MongoDB, user notified via Socket.io + email
