const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const { protect } = require("../../middleware/auth.middleware");
const parseResume = require("../../utils/parseResume");
const { runAgent } = require("../../utils/agentRunner");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("PDF or DOCX only"));
  },
});

// POST /agent/upload-context
// Upload resume + optional JD, returns parsed text (stored in session/body for next call)
router.post("/upload-context", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const resumeText = await parseResume(req.file);
    res.json({ resumeText });
  } catch (err) {
    res.status(500).json({ message: "Parse failed", error: err.message });
  }
});

// POST /agent/chat  — SSE streaming endpoint
// Body: { message, resumeText, jobDescription }
router.post("/chat", async (req, res) => {
  const { message, resumeText, jobDescription } = req.body;

  if (!message) return res.status(400).json({ message: "Message is required" });

  // Set up Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    const agentGen = runAgent(message, resumeText || "", jobDescription || "");

    for await (const event of agentGen) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
  } finally {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  }
});

module.exports = router;