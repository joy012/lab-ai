<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

<h1 align="center">🔬 LabAI</h1>
<p align="center">
  <strong>AI-Powered Lab Report Interpreter</strong>
</p>
<p align="center">
  Turn complex medical lab reports into understandable health insights — for patients and doctors alike.
</p>

<p align="center">
  <sub>📱 Mobile-first • 🇧🇩 Built for Bangladesh • 🌐 English & Bangla support</sub>
</p>

---

## ✨ What It Does

| Step | Feature | Description |
|:----:|---------|-------------|
| 📤 | **Upload** | Take a photo, pick from gallery, or upload PDFs of lab reports |
| 🔍 | **Extract** | Gemini Vision OCR reads every test value, reference range, and lab name |
| 🧠 | **Interpret** | AI analyzes results with diagnosis, risk assessment, and recommendations |
| 👨‍⚕️ | **Role-based** | Doctors get clinical terminology; patients get friendly, simple explanations |
| 🌍 | **Bangla** | Diagnosis and summary in both English and Bengali |

---

## 🚀 Key Features

<table>
<tr>
<td width="50%">

#### 🔒 Reliability
- **Deterministic risk scoring** — Server-side computation, consistent every time
- **Multi-file upload** — Up to 10 images/PDFs per report
- **Automatic fallback** — Gemini → Groq when needed

#### 📱 Experience
- **Image lightbox** — Tap for fullscreen, pinch-to-zoom
- **Real-time progress** — Socket.io updates during AI analysis
- **Dark mode** — Full theme support

</td>
<td width="50%">

#### 📊 Insights
- **PDF export** — Download analyzed reports
- **Report comparison** — Side-by-side comparison
- **Health trends** — Track values across reports over time

#### 🔔 Engagement
- **Email notifications** — When analysis completes or critical values found
- **Cloud storage** — Images/PDFs via Cloudinary

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Apps

| App | Stack | Description |
|-----|-------|-------------|
| `apps/mobile` | Expo · React Native | 📱 iOS/Android mobile app |
| `apps/backend` | NestJS | 🔧 REST API + WebSocket server |
| `apps/web` | Next.js | 🌐 Web dashboard (WIP) |

### Shared Libraries

| Package | Description |
|---------|-------------|
| `libs/api-client` | 📡 Type-safe API client with React Query hooks |
| `libs/email-templates` | 📧 React Email templates |

### AI & Infrastructure

| Service | Purpose |
|---------|---------|
| 🤖 **Gemini 2.5 Flash/Pro** | Lab report OCR + interpretation (with automatic fallback) |
| 🦙 **Groq (Llama 3.3)** | Fallback for text-only interpretation |
| 🗄️ **MongoDB** | Database (via Prisma) |
| ☁️ **Cloudinary** | Image/PDF storage |
| ⚡ **Socket.io** | Real-time processing updates |

---

## 📁 Project Structure

```
lab-report-app/
├── apps/
│   ├── mobile/          📱 Expo React Native app
│   ├── backend/         🔧 NestJS API server
│   └── web/             🌐 Next.js web app
├── libs/
│   ├── api-client/      📡 Shared API client + types
│   └── email-templates/ 📧 Email templates
└── packages/
    ├── eslint-config/   📏 Shared ESLint config
    └── typescript-config/ 📘 Shared TypeScript config
```

---

## 🏃 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** — Package manager
- **MongoDB** — Local or [MongoDB Atlas](https://mongodb.com) free tier

### Quick Setup

```bash
# 1️⃣ Install dependencies
pnpm install

# 2️⃣ Configure environment
cp apps/backend/env.yaml.example apps/backend/env.yaml

# 3️⃣ Push database schema
cd apps/backend && npx prisma db push

# 4️⃣ Start development
pnpm dev
```

### Environment Variables

| Variable | Get it | Description |
|----------|--------|-------------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | Free tier available |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Free tier available |
| `CLOUDINARY` | [cloudinary.com](https://cloudinary.com) | Free tier available |
| `MongoDB` | [MongoDB Atlas](https://mongodb.com) | Free tier available |

See `apps/backend/env.yaml.example` for the complete list.

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  Mobile App │────▶│  NestJS API │────▶│  Gemini AI (OCR +   │
│  (Expo)     │     │             │     │  Interpretation)    │
└──────┬──────┘     └──────┬──────┘     └──────────┬──────────┘
       │                   │                       │
       │                   │                       ▼
       │                   │              ┌───────────────┐
       │                   │              │ Groq (fallback)│
       │                   ▼              └───────────────┘
       │            ┌─────────────┐
       │            │  MongoDB    │
       │            └─────────────┘
       │                   ▲
       └── Socket.io ──────┘  (real-time progress)
```

### Processing Flow

1. 📤 User uploads images/PDFs
2. ☁️ Backend saves to Cloudinary, creates report record
3. 🔍 Gemini Vision extracts all lab values via OCR
4. ✅ Server normalizes values (lowercase status, validate ranges)
5. 📊 Server computes risk score + diagnosis severity (deterministic)
6. 🤖 AI generates diagnosis text, summary, recommendations (role-based)
7. 💾 Results saved to MongoDB, user notified via Socket.io + email

---

<p align="center">
  <strong>LabAI</strong> — Making lab reports understandable for everyone. 🩺
</p>
