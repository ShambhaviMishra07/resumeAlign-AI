const parseResume = require("../../utils/parseResume");
const scoreATS = require("../../utils/atsScorer");
const matchJD = require("../../utils/jdMatcher");
const { getAIFeedback } = require("../../utils/aiAnalyzer");


// POST /analyze/ats
const analyzeATS = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    // Step 1 - Parse the file
    const resumeText = await parseResume(req.file);

    if (!resumeText || resumeText.trim().length === 0)
      return res.status(400).json({ message: "Could not extract text from file" });

    // Step 2 - Score it
    const atsResult = scoreATS(resumeText);

    res.json({
      message: "ATS analysis complete",
      resumeText,
      atsResult,
    });
  } catch (err) {
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
};


// POST /analyze/match
const matchJob = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription)
      return res.status(400).json({
        message: "Both resumeText and jobDescription are required",
      });

    if (jobDescription.trim().length < 50)
      return res.status(400).json({
        message: "Job description is too short — paste the full JD",
      });

    const result = matchJD(resumeText, jobDescription);

    res.json({
      message: "Job match complete",
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: "Matching failed", error: err.message });
  }
};


// POST /analyze/ai-feedback
const aiFeedback = async (req, res) => {
  try {
    const { resumeText, atsResult } = req.body;

    if (!resumeText)
      return res.status(400).json({ message: "resumeText is required" });

    if (!atsResult)
      return res.status(400).json({ message: "atsResult is required" });

    const feedback = await getAIFeedback(resumeText, atsResult);

    res.json({
      message: "AI feedback generated successfully",
      feedback,
    });
  } catch (err) {
    res.status(500).json({ message: "AI feedback failed", error: err.message });
  }
};

module.exports = { analyzeATS, matchJob, aiFeedback };
