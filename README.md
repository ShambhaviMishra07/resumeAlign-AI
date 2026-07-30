# ResumeAI

> AI-powered resume analyzer, job matcher, and builder — with a tool-calling AI agent that autonomously optimizes your resume.

No account needed to analyze. Sign in only to build and save your resume.

---

## What it does

| Feature | Description |
|---------|-------------|
| **ATS Scoring** | Evaluates your resume across 5 categories — sections, keywords, action verbs, length, and contact info — and returns a weighted score out of 100 |
| **Job Description Matching** | Extracts keywords from any JD and compares them against your resume using a weighted system. Missing skills are ranked High / Medium / Low priority |
| **AI Feedback** | Groq LLaMA 3 returns a structured critique with strengths, improvement suggestions, and rewritten bullet points |
| **AI Agent** | A tool-calling agent that reads your goal, decides which tools to run and in what order, and streams results back in real time |
| **Resume Builder** | JWT-protected builder with live preview and one-click PDF export. Sections match a real student resume — projects with bullets, categorized skills, education, hackathons, courses, languages |

---

## Tech Stack

**Frontend** — React, Vite, Tailwind CSS, Framer Motion, React Dropzone  
**Backend** — Node.js, Express.js  
**Database** — MongoDB, Mongoose  
**Authentication** — JWT, bcryptjs  
**AI** — Groq API (LLaMA 3 — `llama3-8b-8192`)  
**Resume Parsing** — pdf-parse (PDF), mammoth (DOCX)  
**PDF Export** — Puppeteer  
**File Handling** — Multer (memory storage)  
**Streaming** — Server-Sent Events (SSE)  

---

## Project Structure

```
resumeai/
│
├── server/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.js        # JWT verification
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.model.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   ├── resume/
│   │   │   ├── resume.model.js
│   │   │   ├── resume.controller.js  # includes PDF generation
│   │   │   └── resume.routes.js
│   │   ├── analyze/
│   │   │   ├── analyze.controller.js
│   │   │   └── analyze.routes.js
│   │   └── agent/
│   │       └── agent.routes.js       # SSE streaming endpoint
│   ├── utils/
│   │   ├── parseResume.js            # PDF + DOCX text extraction
│   │   ├── atsScorer.js              # Rule-based ATS scoring engine
│   │   ├── jdMatcher.js              # Weighted keyword matcher
│   │   ├── aiAnalyzer.js             # Groq AI feedback
│   │   └── agentRunner.js            # Tool-calling agent loop
│   └── server.js
│
└── client/
    └── src/
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Analyzer.jsx          # Public — no login needed
            ├── Agent.jsx             # Public — no login needed
            └── ResumeBuilder.jsx     # Protected — login required
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Groq API key — free at [console.groq.com](https://console.groq.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/resumeai.git
cd resumeai
```

---

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
GROQ_API_KEY=your_groq_api_key
```

Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

> The Vite proxy is already configured — all `/auth`, `/analyze`, `/resume`, and `/agent` requests automatically forward to the backend.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register with name, email, password |
| POST | `/auth/login` | Public | Login, returns JWT token |

### Analyze (all public — no login needed)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/analyze/ats` | Public | Upload resume file, get ATS score + breakdown |
| POST | `/analyze/match` | Public | Send resumeText + jobDescription, get match score |
| POST | `/analyze/ai-feedback` | Public | Send resumeText + atsResult, get Groq AI feedback |

### Agent (public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/agent/upload-context` | Public | Upload resume file, returns parsed text |
| POST | `/agent/chat` | Public | Send message + context, streams SSE events |

### Resume Builder (all protected)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/resume` | JWT | Fetch saved resume |
| POST | `/resume` | JWT | Create new resume |
| PUT | `/resume` | JWT | Update existing resume |
| POST | `/resume/download-pdf` | JWT | Generate and download resume as PDF |

---

## How the AI Agent Works

The agent uses Groq's LLaMA 3 with OpenAI-compatible tool calling. When you send a message, the model reads your intent and decides which tools to invoke — you don't hardcode the sequence.

**Available tools:**

| Tool | What it does |
|------|-------------|
| `analyze_ats` | Runs the ATS scoring engine on your resume |
| `match_job_description` | Compares resume keywords against a job description |
| `rewrite_resume_bullets` | Rewrites weak bullet points with stronger action verbs |
| `suggest_missing_skills` | Recommends skills to add based on your target role |

**Flow:**

```
User sends message
        ↓
LLaMA 3 reads intent + resume context
        ↓
Agent decides which tools to call (and in what order)
        ↓
Each tool runs → result sent back to model
        ↓
Model decides: call another tool OR give final answer
        ↓
Final response streamed to UI via SSE
```

Tool call pills appear in the chat UI with a live spinner while running and a checkmark when done. The final AI response appears below.

---

## ATS Scoring Breakdown

The scoring engine checks 5 categories with different maximum points:

| Category | Max Points | What it checks |
|----------|-----------|----------------|
| Sections | 30 | Detects experience, education, skills, projects, summary, etc. |
| Keywords | 25 | Matches against 30+ common tech keywords |
| Action Verbs | 20 | Counts strong verbs like developed, built, optimized, led |
| Length | 15 | Ideal range is 200–800 words |
| Contact Info | 10 | Checks for email and phone number |

---

## Resume Builder Sections

The builder mirrors a real student resume structure:

- **Personal Info** — Name, email, phone, GitHub, LeetCode, LinkedIn, About Me
- **Education** — Institution, degree, score/CGPA, year, location
- **Projects** — Title, tech stack, individual bullet points (add/remove)
- **Skills** — Categorized: Languages, Frameworks & Libraries, Developer Tools, Core Competencies
- **Extras** — Hackathons, Courses, Languages known

Live preview updates as you type. PDF export uses Puppeteer to render a clean, print-ready document.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string from Atlas |
| `JWT_SECRET` | Any secret string for signing tokens |
| `GROQ_API_KEY` | From console.groq.com — free tier available |

---

## Scripts

**Server:**
```bash
npm run dev    # nodemon (development)
npm start      # node server.js (production)
```

**Client:**
```bash
npm run dev    # Vite dev server
npm run build  # Production build
```

---

