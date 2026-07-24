const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./modules/auth/auth.routes");
app.use("/auth", authRoutes);

const uploadRoutes = require("./modules/upload/upload.routes");
app.use("/upload", uploadRoutes);

const analyzeRoutes = require("./modules/analyze/analyze.routes");
app.use("/analyze", analyzeRoutes);

const agentRoutes = require("./modules/agent/agent.routes");
app.use("/agent", agentRoutes);

const resumeRoutes = require("./modules/resume/resume.routes");
app.use("/resume", resumeRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({ message: "ResumeAI API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));