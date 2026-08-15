const mongoose = require("mongoose");

const agentMemorySchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: "anonymous",
    },
    turns: [
      {
        role:      { type: String, enum: ["user", "agent"] },
        content:   { type: String },
        toolsUsed: [{ type: String }],
        atsScoreBefore: { type: Number },
        atsScoreAfter:  { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resumeSnapshot: {
      type: String,
      default: "",
    },
    lastAtsScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete sessions older than 7 days
agentMemorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("AgentMemory", agentMemorySchema);