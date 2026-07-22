const WEIGHTED_KEYWORDS = [
  // Weight 3 — Core technical skills (most important)
  { keyword: "javascript", weight: 3 },
  { keyword: "typescript", weight: 3 },
  { keyword: "python", weight: 3 },
  { keyword: "java", weight: 3 },
  { keyword: "c++", weight: 3 },
  { keyword: "c#", weight: 3 },
  { keyword: "go", weight: 3 },
  { keyword: "rust", weight: 3 },
  { keyword: "kotlin", weight: 3 },
  { keyword: "swift", weight: 3 },
  { keyword: "react", weight: 3 },
  { keyword: "next.js", weight: 3 },
  { keyword: "vue", weight: 3 },
  { keyword: "angular", weight: 3 },
  { keyword: "node.js", weight: 3 },
  { keyword: "express", weight: 3 },
  { keyword: "django", weight: 3 },
  { keyword: "flask", weight: 3 },
  { keyword: "fastapi", weight: 3 },
  { keyword: "spring", weight: 3 },
  { keyword: "mongodb", weight: 3 },
  { keyword: "postgresql", weight: 3 },
  { keyword: "mysql", weight: 3 },
  { keyword: "redis", weight: 3 },
  { keyword: "graphql", weight: 3 },
  { keyword: "machine learning", weight: 3 },
  { keyword: "deep learning", weight: 3 },
  { keyword: "tensorflow", weight: 3 },
  { keyword: "pytorch", weight: 3 },

  // Weight 2 — Important but secondary technical skills
  { keyword: "rest api", weight: 2 },
  { keyword: "docker", weight: 2 },
  { keyword: "kubernetes", weight: 2 },
  { keyword: "aws", weight: 2 },
  { keyword: "gcp", weight: 2 },
  { keyword: "azure", weight: 2 },
  { keyword: "ci/cd", weight: 2 },
  { keyword: "microservices", weight: 2 },
  { keyword: "websockets", weight: 2 },
  { keyword: "html", weight: 2 },
  { keyword: "css", weight: 2 },
  { keyword: "tailwind", weight: 2 },
  { keyword: "redux", weight: 2 },
  { keyword: "sass", weight: 2 },
  { keyword: "sqlite", weight: 2 },
  { keyword: "firebase", weight: 2 },
  { keyword: "scikit-learn", weight: 2 },
  { keyword: "nlp", weight: 2 },
  { keyword: "computer vision", weight: 2 },
  { keyword: "data analysis", weight: 2 },
  { keyword: "github actions", weight: 2 },
  { keyword: "linux", weight: 2 },

  // Weight 1 — Tools and soft skills (least critical)
  { keyword: "git", weight: 1 },
  { keyword: "agile", weight: 1 },
  { keyword: "scrum", weight: 1 },
  { keyword: "communication", weight: 1 },
  { keyword: "teamwork", weight: 1 },
  { keyword: "leadership", weight: 1 },
  { keyword: "problem solving", weight: 1 },
  { keyword: "critical thinking", weight: 1 },
  { keyword: "supabase", weight: 1 },
  { keyword: "laravel", weight: 1 },
];

// Aliases — different ways same skill can be written
const ALIASES = {
  "express": ["express.js", "expressjs"],
  "mongodb": ["mongo", "mongo db"],
  "git": ["github"],
  "javascript": ["js"],
  "typescript": ["ts"],
  "node.js": ["nodejs", "node js"],
  "next.js": ["nextjs", "next js"],
  "vue": ["vue.js", "vuejs"],
  "rest api": ["restful", "rest apis", "restful api", "restful apis"],
  "ci/cd": ["ci cd", "continuous integration", "continuous deployment"],
  "machine learning": ["ml"],
  "deep learning": ["dl"],
  "postgresql": ["postgres"],
  "problem solving": ["problem-solving"],
  "c++": ["cpp"],
  "c#": ["csharp"],
};

const normalize = (text) => text.toLowerCase().trim();

const keywordExistsInText = (keyword, text) => {
  const normalText = normalize(text);
  const normalKeyword = normalize(keyword);

  // Check direct match
 const regex = new RegExp(
  `\\b${normalKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
  "i"
);

if (regex.test(normalText)) return true;

  // Check aliases
  const aliasGroup = ALIASES[normalKeyword];
  if (aliasGroup) {
    return aliasGroup.some((alias) => normalText.includes(alias));
  }

  return false;
};

const matchJD = (resumeText, jobDescription) => {
  // Step 1 — find which weighted keywords appear in the JD
  const jdKeywords = WEIGHTED_KEYWORDS.filter((k) =>
    keywordExistsInText(k.keyword, jobDescription)
  );

  if (jdKeywords.length === 0) {
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      totalRequiredSkills: 0,
      message: "No recognizable keywords found in the job description",
    };
  }

  // Step 2 — check which JD keywords exist in the resume
  const matchedKeywords = jdKeywords.filter((k) =>
    keywordExistsInText(k.keyword, resumeText)
  );
  const missingKeywords = jdKeywords.filter(
    (k) => !keywordExistsInText(k.keyword, resumeText)
  );

  // Step 3 — weighted score calculation
  const totalJDWeight = jdKeywords.reduce((sum, k) => sum + k.weight, 0);
  const matchedWeight = matchedKeywords.reduce((sum, k) => sum + k.weight, 0);
  const matchScore = Math.round((matchedWeight / totalJDWeight) * 100);

  return {
    matchScore,
    matchedKeywords: matchedKeywords.map((k) => k.keyword),
    missingKeywords: missingKeywords.map((k) => ({
      keyword: k.keyword,
      weight: k.weight,
      importance: k.weight === 3 ? "High" : k.weight === 2 ? "Medium" : "Low",
    })),
    totalRequiredSkills: jdKeywords.length,
  };
};

module.exports = matchJD;