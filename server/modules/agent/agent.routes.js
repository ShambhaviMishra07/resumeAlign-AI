const express     = require("express");
const router      = express.Router();
const multer      = require("multer");
const parseResume = require("../../utils/parseResume");
const { runAgent } = require("../../utils/agentRunner");
const AgentMemory  = require("./agent.memory.model");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("PDF or DOCX only"));
  },
});

// POST /agent/upload-context
// Parse uploaded resume — returns text
router.post("/upload-context", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const resumeText = await parseResume(req.file);
    res.json({ resumeText });
  } catch (err) {
    res.status(500).json({ message: "Parse failed", error: err.message });
  }
});

// GET /agent/memory/:sessionId
// Load memory for a session
router.get("/memory/:sessionId", async (req, res) => {
  try {
    const session = await AgentMemory.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.json({ turns: [], lastAtsScore: null });

    res.json({
      turns:        session.turns,
      lastAtsScore: session.lastAtsScore,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load memory", error: err.message });
  }
});

// GET /agent/sessions/:userId
// Load all sessions for a user (for session picker UI)
router.get("/sessions/:userId", async (req, res) => {
  try {
    const sessions = await AgentMemory.find(
      { userId: req.params.userId },
      { sessionId: 1, createdAt: 1, lastAtsScore: 1, "turns": { $slice: 1 } }
    )
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: "Failed to load sessions" });
  }
});

// POST /agent/chat
// Main SSE streaming endpoint
router.post("/chat", async (req, res) => {
  const { message, resumeText, jobDescription, cachedATS, sessionId, userId } = req.body;

  if (!message)
    return res.status(400).json({ message: "Message is required" });

  // Set up SSE headers
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // Load memory for this session
    let session = null;
    let memoryTurns = [];

    if (sessionId) {
      session = await AgentMemory.findOne({ sessionId });
      if (session) memoryTurns = session.turns;
    }

    // Run the agent
    let metadata = null;

    const agentGen = runAgent(
      message,
      resumeText || "",
      jobDescription || "",
      cachedATS || (session?.lastAtsScore ? { score: session.lastAtsScore } : null),
      memoryTurns
    );

    for await (const event of agentGen) {
      if (event.type === "metadata") {
        metadata = event;
      } else {
        send(event);
      }
    }

    // Save turn to memory
    if (sessionId) {
      const userTurn = {
        role:    "user",
        content: message,
      };

      const agentTurn = {
        role:           "agent",
        content:        metadata?.finalContent || "",
        toolsUsed:      metadata?.toolsUsed || [],
        atsScoreBefore: metadata?.atsScoreBefore,
        atsScoreAfter:  metadata?.atsScoreAfter,
      };

      if (!session) {
        // Create new session
        session = await AgentMemory.create({
          sessionId,
          userId:        userId || "anonymous",
          turns:         [userTurn, agentTurn],
          lastAtsScore:  metadata?.atsScoreAfter || null,
          resumeSnapshot: (resumeText || "").slice(0, 500),
        });
      } else {
        // Append to existing session — keep max 20 turns
        session.turns.push(userTurn, agentTurn);
        if (session.turns.length > 20) {
          session.turns = session.turns.slice(-20);
        }
        if (metadata?.atsScoreAfter) {
          session.lastAtsScore = metadata.atsScoreAfter;
        }
        await session.save();
      }
    }

    send({ type: "done" });
  } catch (err) {
    send({ type: "error", content: err.message });
    send({ type: "done" });
  } finally {
    res.end();
  }
});

// DELETE /agent/memory/:sessionId
// Clear a session
router.delete("/memory/:sessionId", async (req, res) => {
  try {
    await AgentMemory.deleteOne({ sessionId: req.params.sessionId });
    res.json({ message: "Session cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear session" });
  }
});

module.exports = router;