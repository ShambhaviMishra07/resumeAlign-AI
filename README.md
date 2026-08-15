# ResumeAlign AI

> An agentic AI-powered resume analyzer, optimizer, and builder — built with the MERN stack and Groq LLaMA 3.

---

## Overview

ResumeAlign AI is a full-stack web application that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). It combines a rule-based scoring engine, a weighted job description matcher, and an autonomous AI agent powered by Groq LLaMA 3 that selects and sequences analysis tools based on user intent. The agent remembers conversations across sessions and self-corrects its rewrites by re-scoring after every improvement attempt.

No account is needed to analyze a resume. Sign in only to build and save your resume.

---

## Features

### 🎯 ATS Scoring
Rule-based engine evaluates resumes across five weighted categories — section detection, keyword density, action verbs, resume length, and contact info — returning a score out of 100 with a full per-category breakdown.

### 🔍 Job Description Matching
Extracts keywords from any job description and compares them against your resume using a weighted keyword system. Missing skills are ranked by **High / Medium / Low** priority so you know what to fix first.

### 🤖 AI Feedback
Groq LLaMA 3 analyzes your resume and returns a structured critique — overall assessment, specific strengths, five actionable suggestions, and rewritten bullet points with stronger action verbs.

### ⚡ Agentic AI System
A tool-calling agent powered by Groq LLaMA 3 with OpenAI-compatible function calling. The model reads your intent and autonomously decides which tools to invoke and in what order — you never hardcode the sequence. Results stream to the UI in real time via Server-Sent Events (SSE).

**Available tools:**

| Tool | Description |
|------|-------------|
| `analyze_ats` | Runs the ATS scoring engine on your resume |
| `match_job_description` | Compares resume keywords against a JD |
| `rewrite_resume_bullets` | Rewrites weak bullets with stronger phrasing |
| `suggest_missing_skills` | Recommends skills based on target role |

### 🧠 Memory Across Sessions
Every conversation turn is saved to MongoDB with a 7-day TTL. When you return, the agent restores your last session — it won't re-analyze things it already knows, saving API tokens and giving a continuous experience.

### 🔄 Self-Correction Loop
After every bullet rewrite, the agent automatically re-runs the ATS scorer on the improved text. If the score didn't improve by at least 5 points, it retries with targeted feedback. Maximum 2 correction attempts per rewrite. Score changes are shown live in the UI as `68 → 91 (+23 pts)`.

### 📄 Resume Builder
JWT-protected builder that mirrors a real student resume structure — personal info with GitHub / LeetCode / LinkedIn links, education, projects with individual bullet points, categorized skills, hackathons, courses, and languages. Includes a sticky live preview and one-click PDF export via Puppeteer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Dropzone |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| AI | Groq API — LLaMA 3 (`llama3-8b-8192`) |
| Resume Parsing | pdf-parse (PDF), mammoth (DOCX) |
| PDF Export | Puppeteer |
| File Handling | Multer (memory storage) |
| Streaming | Server-Sent Events (SSE) |

---

## Project Structure

```
resumealign-ai/
│
├── server/
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.js          # JWT verification
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.model.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   ├── resume/
│   │   │   ├── resume.model.js
│   │   │   ├── resume.controller.js   # Includes Puppeteer PDF generation
│   │   │   └── resume.routes.js
│   │   ├── analyze/
│   │   │   ├── analyze.controller.js
│   │   │   └── analyze.routes.js
│   │   └── agent/
│   │       ├── agent.memory.model.js  # Session memory with 7-day TTL
│   │       └── agent.routes.js        # SSE streaming + memory persistence
│   ├── utils/
│   │   ├── parseResume.js             # PDF + DOCX text extraction
│   │   ├── atsScorer.js               # Rule-based ATS scoring engine
│   │   ├── jdMatcher.js               # Weighted keyword matcher
│   │   ├── aiAnalyzer.js              # Groq structured feedback
│   │   └── agentRunner.js             # Tool-calling agent + self-correction loop
│   └── server.js
│
└── client/
    └── src/
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Landing.jsx            # Public landing page
            ├── Login.jsx              # Register / sign in
            ├── Analyzer.jsx           # Public — no login needed
            ├── Agent.jsx              # Public — no login needed
            └── ResumeBuilder.jsx      # Protected — login required
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account — [mongodb.com/atlas](https://mongodb.com/atlas) (free tier)
- Groq API key — [console.groq.com](https://console.groq.com) (free tier)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/resumealign-ai.git
cd resumealign-ai
```

---

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=any_long_random_string_here
GROQ_API_KEY=your_groq_api_key_here
```

Start the development server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`

> The Vite proxy is pre-configured — all `/auth`, `/analyze`, `/resume`, and `/agent` requests automatically forward to the backend. No extra setup needed.

---

## Environment Variables

| Variable | Where to get it | Description |
|----------|----------------|-------------|
| `PORT` | — | Server port, defaults to 5000 |
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers | Full connection string including database name |
| `JWT_SECRET` | — | Any long random string, used to sign tokens |
| `GROQ_API_KEY` | console.groq.com → API Keys | Free tier supports LLaMA 3 models |

---

## API Reference

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register with name, email, password |
| POST | `/auth/login` | Public | Login — returns JWT token |

### Analyze (no login required)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/analyze/ats` | Public | Upload resume file — returns ATS score and breakdown |
| POST | `/analyze/match` | Public | Send `resumeText` + `jobDescription` — returns weighted match score |
| POST | `/analyze/ai-feedback` | Public | Send `resumeText` + `atsResult` — returns Groq AI critique |

### Agent (no login required)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/agent/upload-context` | Public | Upload resume file — returns parsed text |
| POST | `/agent/chat` | Public | Send message + context — streams SSE events |
| GET | `/agent/memory/:sessionId` | Public | Load saved turns for a session |
| DELETE | `/agent/memory/:sessionId` | Public | Clear a session from memory |

### Resume Builder (login required)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/resume` | JWT | Fetch saved resume |
| POST | `/resume` | JWT | Create new resume |
| PUT | `/resume` | JWT | Update existing resume |
| POST | `/resume/download-pdf` | JWT | Generate and download resume as PDF |

---

## How the AI Agent Works

```
User sends message + resume text
            ↓
Load last 6 turns from MongoDB (memory)
            ↓
LLaMA 3 reads intent + memory context
            ↓
Agent decides which tools to call and in what order
            ↓
Tool executes → result streamed to UI
            ↓
After rewrite_resume_bullets → auto re-score ATS
            ↓
Score improved by 5+ pts?
    YES → done, save turn to MongoDB
    NO  → retry with correction feedback (max 2x)
            ↓
Final response streamed → turn saved to memory
```

The agent loop runs for a maximum of 4 iterations per message to prevent runaway token usage. Tool results are truncated to 600 characters before being added back to the message history.

---

## ATS Scoring Breakdown

| Category | Max Points | What it checks |
|----------|-----------|----------------|
| Sections | 30 | Detects experience, education, skills, projects, summary |
| Keywords | 25 | Matches against 30+ technical keywords |
| Action Verbs | 20 | Counts strong verbs — developed, optimized, architected, led |
| Length | 15 | Ideal range is 200–800 words |
| Contact Info | 10 | Checks for email address and phone number |

---

## Resume Builder Sections

The builder mirrors a real student/fresher resume structure:

| Section | Fields |
|---------|--------|
| Personal Info | Name, email, phone, GitHub, LeetCode, LinkedIn, About Me |
| Education | Institution, degree, score/CGPA, year, location |
| Projects | Title, tech stack, individual bullet points (add/remove per bullet) |
| Skills | Categorized — Languages, Frameworks & Libraries, Developer Tools, Core Competencies |
| Extras | Hackathons, Courses, Languages known |

Live preview updates as you type. PDF export uses Puppeteer to render a clean, ATS-friendly document.

---

## Scripts

**Server:**

```bash
npm run dev     # nodemon — hot reload for development
npm start       # node server.js — production
```

**Client:**

```bash
npm run dev     # Vite dev server with HMR
npm run build   # Production build to dist/
npm run preview # Preview production build locally
```

---

## Limitations

- Groq free tier has rate limits — if the agent fails after several messages, wait 1 minute before retrying
- Puppeteer requires a Chromium binary — on some cloud platforms you may need to set `--no-sandbox` args (already configured)
- Agent memory auto-expires after 7 days via MongoDB TTL index
- File uploads are handled in memory — max file size is 5 MB


---