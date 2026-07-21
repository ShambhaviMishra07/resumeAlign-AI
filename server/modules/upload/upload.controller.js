const parseResume = require("../../utils/parseResume");

// POST /upload/parse
const parseResumeFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const resumeText = await parseResume(req.file);

    if (!resumeText || resumeText.trim().length === 0)
      return res.status(400).json({ message: "Could not extract text from file" });

    res.json({
      message: "Resume parsed successfully",
      wordCount: resumeText.split(/\s+/).length,
      resumeText,
    });
  } catch (err) {
    res.status(500).json({ message: "Parsing failed", error: err.message });
  }
};

module.exports = { parseResumeFile };