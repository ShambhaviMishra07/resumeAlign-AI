
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { initGroqModel } = require("./utils/getGroqModel");

const app = express();

connectDB();

// Auto-detect working Groq model at startup
initGroqModel();

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-app-name.vercel.app", // update this after deploying frontend
  process.env.FRONTEND_URL,           // set this in Render env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

const authRoutes = require("./modules/auth/auth.routes");
const analyzeRoutes = require("./modules/analyze/analyze.routes");
const resumeRoutes = require("./modules/resume/resume.routes");
const agentRoutes = require("./modules/agent/agent.routes");

app.use("/auth", authRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/resume", resumeRoutes);
app.use("/agent", agentRoutes);

app.get("/", (req, res) =>
  res.json({ message: "ResumeAlign AI API running" })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
