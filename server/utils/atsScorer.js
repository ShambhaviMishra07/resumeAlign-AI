const SECTIONS = [
  "experience",
  "education",
  "skills",
  "projects",
  "summary",
  "objective",
  "certifications",
  "achievements",
];

const TECH_KEYWORDS = [
  "javascript", "python", "java", "node.js", "react", "express", "mongodb",
  "sql", "html", "css", "git", "docker", "aws", "typescript", "next.js",
  "vue", "angular", "rest", "api", "graphql", "redis", "postgresql", "mysql",
  "linux", "agile", "scrum", "ci/cd", "kubernetes", "machine learning",
  "deep learning", "tensorflow", "pytorch", "flask", "django", "spring",
];

const ACTION_VERBS = [
  "developed", "built", "designed", "implemented", "created", "led", "managed",
  "improved", "optimized", "reduced", "increased", "delivered", "architected",
  "engineered", "deployed", "integrated", "automated", "spearheaded", "launched",
  "collaborated", "mentored", "resolved", "analyzed", "established", "streamlined",
];

const scoreATS = (text) => {
  const lower = text.toLowerCase();
  const issues = [];
  let score = 0;

  // --- 1. Section Detection (30 points) ---
  const sectionsFound = SECTIONS.filter((s) => lower.includes(s));
  const criticalSections = ["experience", "education", "skills"];
  const missingSections = criticalSections.filter((s) => !lower.includes(s));

  score += Math.min(30, sectionsFound.length * 5);

  if (missingSections.length > 0)
    issues.push(`Missing critical sections: ${missingSections.join(", ")}`);

  // --- 2. Keyword Density (25 points) ---
  const keywordsFound = TECH_KEYWORDS.filter((k) => lower.includes(k));
  score += Math.min(25, keywordsFound.length * 2);

  if (keywordsFound.length < 5)
    issues.push("Add more technical keywords relevant to your target role");

  // --- 3. Action Verbs (20 points) ---
  const actionVerbsFound = ACTION_VERBS.filter((v) => lower.includes(v));
  score += Math.min(20, actionVerbsFound.length * 3);

  if (actionVerbsFound.length < 3)
    issues.push("Use stronger action verbs like 'developed', 'optimized', 'led'");

  // --- 4. Resume Length (15 points) ---
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200 && wordCount <= 800) {
    score += 15;
  } else if (wordCount < 200) {
    score += 5;
    issues.push("Resume is too short — add more detail to your experience and projects");
  } else {
    score += 8;
    issues.push("Resume may be too long — try to keep it to 1-2 pages");
  }

  // --- 5. Contact Info (10 points) ---
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);

  if (hasEmail) score += 5;
  else issues.push("No email address detected — make sure it's clearly visible");

  if (hasPhone) score += 5;
  else issues.push("No phone number detected — add your contact number");

  return {
    score: Math.min(100, Math.round(score)),
    breakdown: {
      sections: Math.min(30, sectionsFound.length * 5),
      keywords: Math.min(25, keywordsFound.length * 2),
      actionVerbs: Math.min(20, actionVerbsFound.length * 3),
      length: wordCount >= 200 && wordCount <= 800 ? 15 : wordCount < 200 ? 5 : 8,
      contactInfo: (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0),
    },
    sectionsFound,
    missingSections,
    keywordsFound,
    actionVerbsFound,
    wordCount,
    hasEmail,
    hasPhone,
    issues,
  };
};

module.exports = scoreATS;