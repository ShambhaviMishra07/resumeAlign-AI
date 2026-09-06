const Groq = require("groq-sdk");

let cachedModel = null;

const getGroqModel = async () => {
  if (cachedModel) return cachedModel;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.models.list();
    const activeIds = response.data.map((m) => m.id);

    console.log("✅ Active Groq models:", activeIds.join(", "));

    // Models that support chat completions — filter out
    // whisper (audio), prompt-guard (classification), orpheus (TTS)
    const SKIP = ["whisper", "prompt-guard", "orpheus", "safeguard"];
    const chatModels = activeIds.filter(
      (id) => !SKIP.some((skip) => id.toLowerCase().includes(skip))
    );

    console.log("✅ Chat-capable models:", chatModels.join(", "));

    // Preferred order — update this list from your terminal output
    const PREFERRED = [
      "qwen/qwen3.8-27b",
      "qwen/qwen3.6-27b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "groq/compound",
      "groq/compound-mini",
      "allam-2-7b",
    ];

    // Try preferred first
    const preferred = PREFERRED.find((m) => chatModels.includes(m));
    if (preferred) {
      cachedModel = preferred;
      console.log(`✅ Selected model: ${preferred}`);
      return preferred;
    }

    // Fall back to first available chat model
    if (chatModels.length > 0) {
      cachedModel = chatModels[0];
      console.log(`⚠️  Using first available chat model: ${chatModels[0]}`);
      return chatModels[0];
    }

    throw new Error("No chat models available");
  } catch (err) {
    console.error("❌ Model fetch failed:", err.message);
    // Last resort — use whatever is in .env
    cachedModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
    console.log(`⚠️  Fallback model: ${cachedModel}`);
    return cachedModel;
  }
};

const initGroqModel = async () => {
  await getGroqModel();
};

// Reset cache so next request re-fetches
// Call this if you get a model_not_found error at runtime
const resetModelCache = () => {
  cachedModel = null;
  console.log("🔄 Model cache cleared — will re-fetch on next request");
};

module.exports = { getGroqModel, initGroqModel, resetModelCache };