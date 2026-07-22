const Resume = require("./resume.model");

// GET /resume — get logged in user's resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume)
      return res.status(404).json({ message: "No resume found" });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /resume — create resume
const createResume = async (req, res) => {
  try {
    const existing = await Resume.findOne({ user: req.user._id });
    if (existing)
      return res.status(400).json({ message: "Resume already exists. Use PUT to update." });

    const resume = await Resume.create({
      user: req.user._id,
      ...req.body,
    });
    res.status(201).json({ message: "Resume created", resume });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /resume — update resume
const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      // Auto-create if doesn't exist
      resume = await Resume.create({ user: req.user._id, ...req.body });
      return res.status(201).json({ message: "Resume created", resume });
    }

    const { personalInfo, education, experience, projects, skills, certifications } = req.body;

    if (personalInfo) resume.personalInfo = personalInfo;
    if (education) resume.education = education;
    if (experience) resume.experience = experience;
    if (projects) resume.projects = projects;
    if (skills) resume.skills = skills;
    if (certifications) resume.certifications = certifications;

    await resume.save();
    res.json({ message: "Resume updated", resume });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getResume, createResume, updateResume };