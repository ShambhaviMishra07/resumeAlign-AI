const dotenv = require("dotenv");
dotenv.config();

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const { initGroqModel } = require("./utils/getGroqModel");

const app = express();
connectDB();

// Auto-detect working Groq model at startup
initGroqModel();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const authRoutes    = require("./modules/auth/auth.routes");
const analyzeRoutes = require("./modules/analyze/analyze.routes");
const resumeRoutes  = require("./modules/resume/resume.routes");
const agentRoutes   = require("./modules/agent/agent.routes");

app.use("/auth",    authRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/resume",  resumeRoutes);
app.use("/agent",   agentRoutes);

app.get("/", (req, res) => res.json({ message: "ResumeAlign AI API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));