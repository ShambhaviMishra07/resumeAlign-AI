const parseResume = require("../../utils/parseResume");
const scoreATS = require("../../utils/atsScorer");

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

module.exports = { analyzeATS };