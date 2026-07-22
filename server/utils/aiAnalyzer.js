const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIFeedback = async (resumeText, atsResult) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume coach, ATS reviewer, and technical recruiter. Return only valid JSON. Use only facts explicitly present in the resume and ATS analysis. Never invent metrics, percentages, achievements, users, revenue, accuracy values, or results."
        }, {
          role: "user",
          content: `
      Analyze this resume as an ATS reviewer and technical recruiter.

Focus on:
- ATS compatibility
- Missing sections
- Missing keywords
- Project quality
- Technical impact
- Recruiter appeal

Prioritize actionable feedback that will increase interview chances.

RESUME TEXT:
${resumeText.slice(0, 8000)}

ATS SCORE: ${atsResult.score}/100
SECTIONS FOUND: ${atsResult.sectionsFound.join(", ")}
MISSING SECTIONS: ${atsResult.missingSections.join(", ") || "none"}
KEYWORDS FOUND: ${atsResult.keywordsFound.join(", ")}
ISSUES DETECTED: ${atsResult.issues.join(", ") || "none"}

IMPORTANT RULES:

1. Never invent metrics, percentages, user counts, revenue figures, accuracy values, performance improvements, or achievements.

2. Only use information explicitly present in the resume.

3. For improvedBullets.original:
   - Copy an exact bullet point from the resume.
   - Do not paraphrase, shorten, summarize, or add ellipses.

4. For improvedBullets.improved:
   - Rewrite the bullet to be clearer, stronger, and more recruiter-friendly.
   - Preserve all technologies, metrics, and facts already present.
   - Do not add new facts or numbers.

5. Select bullet points only from the Projects section.

6. Do not use project titles, headings, section names, skill names, or technology lists as bullet points.

7. Prioritize ATS-related feedback, missing sections, missing keywords, and recruiter concerns.

8. Avoid generic resume advice unless directly relevant to the resume.

9. At least 3 suggestions must be based on ATS issues, missing sections, or missing keywords provided above.

10. Return exactly 2 objects in the improvedBullets array.



Respond with this exact JSON format:

{
  "summary": "2-3 sentence honest overall assessment",
  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],
  "suggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3",
    "specific actionable suggestion 4",
    "specific actionable suggestion 5"
  ],
  "improvedBullets": [
  {
  "original": "Developed a Flask-powered web interface with real-time form-based prediction, replacing terminal-based output with a responsive dark-themed UI for seamless teacher-student interaction.",
  "improved": "Developed a Flask-powered web interface with real-time form-based prediction and a responsive dark-themed UI, replacing terminal-based workflows and improving usability for teacher-student interaction."
},
    {
  "original": "Implemented Redis caching (LPUSH/LTRIM, 24-hour TTL) for message, reducing MongoDB reads by ~80%.",
  "improved": "Implemented Redis caching using LPUSH/LTRIM with a 24-hour TTL, reducing MongoDB reads by approximately 80% and improving message retrieval efficiency."
}
  ]
}
`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content;

    const feedback = JSON.parse(text);

feedback.improvedBullets = Array.isArray(feedback.improvedBullets)
  ? feedback.improvedBullets.slice(0, 2)
  : [];

return feedback;
    
  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error(`Failed to generate AI feedback: ${error.message}`);
  }
};

module.exports = { getAIFeedback };