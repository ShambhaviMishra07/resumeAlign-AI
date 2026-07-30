const Groq = require("groq-sdk");
const scoreATS = require("./atsScorer");
const matchJD  = require("./jdMatcher");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Tool definitions (what the agent can call) ──
const TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_ats",
      description: "Analyzes resume text and returns an ATS score with breakdown, sections found, keywords, and issues.",
      parameters: {
        type: "object",
        properties: {
          resume_text: { type: "string", description: "The full text content of the resume" },
        },
        required: ["resume_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "match_job_description",
      description: "Compares resume text against a job description and returns a weighted match score with matched and missing keywords.",
      parameters: {
        type: "object",
        properties: {
          resume_text:      { type: "string", description: "The full resume text" },
          job_description:  { type: "string", description: "The full job description text" },
        },
        required: ["resume_text", "job_description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "rewrite_resume_bullets",
      description: "Rewrites weak bullet points in the resume to use stronger action verbs and specific impact metrics.",
      parameters: {
        type: "object",
        properties: {
          resume_text: { type: "string", description: "The full resume text" },
          focus_area:  { type: "string", description: "Optional focus: e.g. 'experience section' or 'projects'" },
        },
        required: ["resume_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_missing_skills",
      description: "Suggests skills and technologies the candidate should add based on their resume and target role.",
      parameters: {
        type: "object",
        properties: {
          resume_text:  { type: "string", description: "The resume text" },
          target_role:  { type: "string", description: "The job role the candidate is targeting" },
        },
        required: ["resume_text"],
      },
    },
  },
];

// ── Tool execution functions ──
const executeTool = async (toolName, args) => {
  if (toolName === "analyze_ats") {
    const result = scoreATS(args.resume_text);
    return JSON.stringify(result);
  }

  if (toolName === "match_job_description") {
    const result = matchJD(args.resume_text, args.job_description);
    return JSON.stringify(result);
  }

  if (toolName === "rewrite_resume_bullets") {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Rewrite weak bullet points to use strong action verbs and quantifiable impact. Return ONLY a JSON array of objects with 'original' and 'improved' keys. No markdown, no explanation.",
        },
        {
          role: "user",
          content: `Resume text:\n${args.resume_text.slice(0, 2500)}\n\nFocus: ${args.focus_area || "all sections"}\n\nFind 3 weak bullets and rewrite them.`,
        },
      ],
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  }

  if (toolName === "suggest_missing_skills") {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are a career coach. Suggest missing skills for a candidate. Return ONLY a JSON object with 'skills' (array of strings) and 'reason' (one sentence). No markdown.",
        },
        {
          role: "user",
          content: `Resume:\n${args.resume_text.slice(0, 2000)}\n\nTarget role: ${args.target_role || "software engineer"}\n\nWhat key skills are missing?`,
        },
      ],
      temperature: 0.6,
    });
    return completion.choices[0].message.content;
  }

  return JSON.stringify({ error: "Unknown tool" });
};

// ── Main agent runner ──
// Returns an async generator so we can stream steps to frontend
const runAgent = async function* (userMessage, resumeText, jobDescription) {
  const messages = [
    {
      role: "system",
      content: `You are an expert AI career coach and resume optimization agent. You have access to tools to analyze resumes, match job descriptions, rewrite bullets, and suggest skills.

When the user asks something, figure out which tools to call and in what order. After using the tools, summarize your findings clearly and helpfully.

Always call analyze_ats first if you have resume text. Then decide what else to do based on the user's goal.

Resume text available: ${resumeText ? "YES" : "NO"}
Job description available: ${jobDescription ? "YES" : "NO"}`,
    },
    {
      role: "user",
      content: userMessage + (resumeText ? `\n\n[RESUME TEXT ATTACHED - ${resumeText.split(" ").length} words]` : "") + (jobDescription ? `\n\n[JOB DESCRIPTION ATTACHED]` : ""),
    },
  ];

  // Inject resume and JD context as assistant context if available
  if (resumeText) {
    messages.push({
      role: "assistant",
      content: `I have the resume text. Let me analyze it now.`,
    });
    messages.push({
      role: "user",
      content: `Resume text for analysis:\n${resumeText.slice(0, 3000)}${jobDescription ? `\n\nJob description:\n${jobDescription.slice(0, 1500)}` : ""}`,
    });
  }

  let iterations = 0;
  const MAX_ITERATIONS = 6;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    messages.push(message);

    // If no tool calls, agent is done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      yield { type: "final", content: message.content };
      break;
    }

    // Execute each tool call
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      const args     = JSON.parse(toolCall.function.arguments);

      // Yield tool start event so frontend can show progress
      yield { type: "tool_start", tool: toolName, args };

      // If resume_text not in args but we have it, inject it
      if (!args.resume_text && resumeText) args.resume_text = resumeText;
      if (!args.job_description && jobDescription) args.job_description = jobDescription;

      const toolResult = await executeTool(toolName, args);

      // Yield tool result
      yield { type: "tool_result", tool: toolName, result: toolResult };

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    yield { type: "final", content: "I've completed my analysis. Check the results above." };
  }
};

module.exports = { runAgent };