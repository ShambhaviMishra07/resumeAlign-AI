const Groq    = require("groq-sdk");
const scoreATS = require("./atsScorer");
const matchJD  = require("./jdMatcher");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Compress resume to save tokens ──
const compressResume = (text) => {
  if (!text) return "";
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 1500);
};

// ── Tool definitions ──
const TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_ats",
      description: "Analyzes resume text and returns ATS score with breakdown, sections, keywords, and issues. Call this first.",
      parameters: {
        type: "object",
        properties: {
          resume_text: { type: "string", description: "The resume text to analyze" },
        },
        required: ["resume_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "match_job_description",
      description: "Compares resume against a job description. Returns weighted match score, matched and missing keywords.",
      parameters: {
        type: "object",
        properties: {
          resume_text:     { type: "string" },
          job_description: { type: "string" },
        },
        required: ["resume_text", "job_description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "rewrite_resume_bullets",
      description: "Rewrites weak bullet points with stronger action verbs and quantifiable impact. Returns improved bullets.",
      parameters: {
        type: "object",
        properties: {
          resume_text: { type: "string" },
          focus_area:  { type: "string", description: "Which section to focus on, e.g. 'projects' or 'experience'" },
          feedback:    { type: "string", description: "Optional feedback from previous attempt to guide improvement" },
        },
        required: ["resume_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_missing_skills",
      description: "Suggests skills to add based on resume and target role.",
      parameters: {
        type: "object",
        properties: {
          resume_text: { type: "string" },
          target_role: { type: "string" },
        },
        required: ["resume_text"],
      },
    },
  },
];

// ── Execute a tool call ──
const executeTool = async (toolName, args) => {
  if (toolName === "analyze_ats") {
    const result = scoreATS(args.resume_text || "");
    return JSON.stringify(result);
  }

  if (toolName === "match_job_description") {
    const result = matchJD(args.resume_text || "", args.job_description || "");
    return JSON.stringify(result);
  }

  if (toolName === "rewrite_resume_bullets") {
    const feedbackLine = args.feedback
      ? `\nPrevious attempt feedback: ${args.feedback}. Try a different approach.`
      : "";

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Rewrite weak bullet points using strong action verbs and quantifiable results. Return ONLY a valid JSON array of objects with 'original' and 'improved' keys. No markdown, no explanation.",
        },
        {
          role: "user",
          content: `Resume:\n${(args.resume_text || "").slice(0, 1200)}\n\nFocus: ${args.focus_area || "all sections"}${feedbackLine}\n\nFind 3 weak bullets and rewrite them. Return JSON array only.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0].message.content;
  }

  if (toolName === "suggest_missing_skills") {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ,
      messages: [
        {
          role: "system",
          content: "You are a career coach. Return ONLY a valid JSON object with 'skills' (string array) and 'reason' (one sentence). No markdown.",
        },
        {
          role: "user",
          content: `Resume:\n${(args.resume_text || "").slice(0, 1000)}\n\nTarget role: ${args.target_role || "software engineer"}\n\nWhat key skills are missing? Return JSON only.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  }

  return JSON.stringify({ error: "Unknown tool" });
};

// ── Self-correction: re-score after rewrite ──
// Returns { improved: boolean, scoreBefore, scoreAfter, feedback }
const selfCorrect = async (resumeText, rewriteResult, previousScore) => {
  // Try to extract improved bullets to test against
  let improvedText = resumeText;
  try {
    const bullets = JSON.parse(rewriteResult);
    if (Array.isArray(bullets)) {
      // Replace original bullets with improved ones in the text
      bullets.forEach(({ original, improved }) => {
        if (original && improved) {
          improvedText = improvedText.replace(original, improved);
        }
      });
    }
  } catch {
    // If parse fails, score the original with improved text appended
    improvedText = resumeText + "\n" + rewriteResult;
  }

  const newScore = scoreATS(improvedText);
  const improved = newScore.score >= (previousScore + 5);

  return {
    improved,
    scoreBefore: previousScore,
    scoreAfter:  newScore.score,
    newAtsResult: newScore,
    feedback: improved
      ? null
      : `Score only went from ${previousScore} to ${newScore.score}. The rewrites weren't strong enough. Use more specific metrics, numbers, and industry-standard action verbs.`,
  };
};

// ── Format memory turns into message history ──
const formatMemory = (turns) => {
  if (!turns || turns.length === 0) return [];

  return turns.slice(-6).map((turn) => ({
    role: turn.role === "agent" ? "assistant" : "user",
    content: turn.content.slice(0, 400), // limit each memory message
  }));
};

// ── Main agent runner ──
// Returns async generator — yields events for SSE streaming
const runAgent = async function* (
  userMessage,
  resumeText,
  jobDescription,
  cachedATS,
  memoryTurns = []
) {
  const compressed   = compressResume(resumeText);
  const pastMessages = formatMemory(memoryTurns);

  // Track what tools got called and ATS scores for self-correction
  let rewriteResult    = null;
  let rewriteAttempts  = 0;
  const MAX_REWRITES   = 2;
  let currentAtsScore  = cachedATS?.score || null;
  let toolsUsedThisRun = [];

  // Build system prompt with memory context
  const memoryContext = memoryTurns.length > 0
    ? `You have memory of ${memoryTurns.length} previous turns with this user. Use that context — don't repeat analyses already done.`
    : "This is the start of the session.";

  const cachedContext = cachedATS
    ? `ATS already scored: ${cachedATS.score}/100. Skip analyze_ats unless user asks for re-analysis.`
    : "";

  const messages = [
    {
      role: "system",
      content: `You are a resume optimization agent with memory and self-correction. Tools: analyze_ats, match_job_description, rewrite_resume_bullets, suggest_missing_skills. ${memoryContext} ${cachedContext} Resume available: ${compressed ? "YES" : "NO"}. JD available: ${jobDescription ? "YES" : "NO"}. Be concise and specific.`,
    },
    // Inject past conversation turns as memory
    ...pastMessages,
    // Current user message with context
    {
      role: "user",
      content: `${userMessage}${compressed ? `\n\n[Resume context — ${compressed.split(" ").length} words available]` : ""}${jobDescription ? "\n[Job description attached]" : ""}`,
    },
  ];

  // Inject resume text as a separate context message if available
  if (compressed) {
    messages.push({
      role: "assistant",
      content: "I have your resume. Let me help you.",
    });
    messages.push({
      role: "user",
      content: `Resume text:\n${compressed}${jobDescription ? `\n\nJob description:\n${jobDescription.slice(0, 800)}` : ""}`,
    });
  }

  let iterations    = 0;
  const MAX_ITER    = 4;
  let finalContent  = "";

  while (iterations < MAX_ITER) {
    iterations++;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 800,
    });

    const message = response.choices[0].message;
    messages.push(message);

    // No tool calls — agent is done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      finalContent = message.content || "";
      yield { type: "final", content: finalContent };
      break;
    }

    // Execute each tool call
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      let   args;

      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }

      // Inject context into args if missing
      if (!args.resume_text    && compressed)    args.resume_text    = compressed;
      if (!args.job_description && jobDescription) args.job_description = jobDescription;

      // Track tools used
      toolsUsedThisRun.push(toolName);

      // Yield tool start so UI shows spinner
      yield { type: "tool_start", tool: toolName };

      let toolResult = await executeTool(toolName, args);

      // ── Self-correction for rewrite_resume_bullets ──
      if (toolName === "rewrite_resume_bullets" && currentAtsScore !== null) {
        rewriteResult = toolResult;

        const correction = await selfCorrect(
          resumeText || compressed,
          rewriteResult,
          currentAtsScore
        );

        // Yield correction event so UI can show score change
        yield {
          type: "self_correction",
          scoreBefore: correction.scoreBefore,
          scoreAfter:  correction.scoreAfter,
          improved:    correction.improved,
        };

        // If not improved and we haven't hit max retries, try again
        if (!correction.improved && rewriteAttempts < MAX_REWRITES) {
          rewriteAttempts++;

          yield {
            type: "tool_start",
            tool: "rewrite_resume_bullets",
            retryAttempt: rewriteAttempts,
          };

          // Re-run with feedback from correction
          const retryArgs = {
            ...args,
            feedback: correction.feedback,
          };

          toolResult = await executeTool("rewrite_resume_bullets", retryArgs);

          // Re-score after retry
          const retryCorrection = await selfCorrect(
            resumeText || compressed,
            toolResult,
            currentAtsScore
          );

          yield {
            type: "self_correction",
            scoreBefore: retryCorrection.scoreBefore,
            scoreAfter:  retryCorrection.scoreAfter,
            improved:    retryCorrection.improved,
            isRetry:     true,
          };

          currentAtsScore = retryCorrection.scoreAfter;
        } else {
          currentAtsScore = correction.scoreAfter;
        }
      }

      // Update cached ATS score after analyze_ats runs
      if (toolName === "analyze_ats") {
        try {
          const parsed = JSON.parse(toolResult);
          if (parsed.score) currentAtsScore = parsed.score;
        } catch {}
      }

      // Yield tool result to UI
      yield { type: "tool_result", tool: toolName, result: toolResult };

      // Add result to message history (truncated to save tokens)
      messages.push({
        role:        "tool",
        tool_call_id: toolCall.id,
        content:     toolResult.slice(0, 600),
      });
    }
  }

  // Yield tools used and score info for memory saving
  yield {
    type: "metadata",
    toolsUsed:    toolsUsedThisRun,
    atsScoreBefore: cachedATS?.score || null,
    atsScoreAfter:  currentAtsScore,
    finalContent,
  };
};

module.exports = { runAgent };