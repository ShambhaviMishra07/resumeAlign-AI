const Resume = require("./resume.model");
const puppeteer = require("puppeteer");


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


const downloadPDF = async (req, res) => {
  try {
    const { personalInfo, education, projects, skills, hackathons, courses, languages } = req.body;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11.5px; color: #111; padding: 36px 44px; line-height: 1.55; }
  .name { font-size: 21px; font-weight: 700; text-align: center; letter-spacing: 0.02em; }
  .contact { text-align: center; color: #444; font-size: 10.5px; margin-top: 3px; }
  .links  { text-align: center; color: #1a56db; font-size: 10.5px; margin-top: 2px; }
  .section-title { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1.5px solid #111; padding-bottom: 2px; margin: 10px 0 6px; }
  .about { font-size: 11px; color: #333; }
  .proj-title { font-weight: 600; font-size: 11.5px; }
  .proj-tech { font-weight: 400; color: #444; }
  .bullet { font-size: 11px; color: #333; padding-left: 10px; margin-top: 2px; }
  .skill-row { font-size: 11px; margin-bottom: 3px; }
  .skill-label { font-weight: 600; }
  .edu-block { margin-bottom: 6px; }
  .edu-row { display: flex; justify-content: space-between; }
  .edu-name { font-weight: 600; font-size: 11.5px; }
  .edu-year { font-size: 10.5px; color: #555; }
  .edu-sub { font-size: 10.5px; color: #444; }
</style>
</head>
<body>

<div class="name">${personalInfo?.fullName || ""}</div>
<div class="contact">${[personalInfo?.email, personalInfo?.phone].filter(Boolean).join("  |  ")}</div>
${(personalInfo?.github || personalInfo?.linkedin || personalInfo?.leetcode) ? `
<div class="links">${[
  personalInfo?.github   && `Github: ${personalInfo.github}`,
  personalInfo?.leetcode && `Leetcode: ${personalInfo.leetcode}`,
  personalInfo?.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
].filter(Boolean).join("  |  ")}</div>` : ""}

${personalInfo?.about ? `
<div class="section-title">About Me</div>
<div class="about">${personalInfo.about}</div>` : ""}

${projects?.some((p) => p.title) ? `
<div class="section-title">Projects</div>
${projects.filter((p) => p.title).map((proj) => `
  <div style="margin-bottom:8px">
    <div class="proj-title">${proj.title}${proj.techStack?.length ? ` <span class="proj-tech">| ${Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack}</span>` : ""}</div>
    ${proj.bullets?.filter(Boolean).map((b) => `<div class="bullet">• ${b}</div>`).join("") || ""}
  </div>`).join("")}` : ""}

${Object.values(skills || {}).some((arr) => arr?.some(Boolean)) ? `
<div class="section-title">Skills</div>
${[
  { label: "Languages",             key: "languages" },
  { label: "Frameworks & Libraries", key: "frameworks" },
  { label: "Developer Tools",       key: "developerTools" },
  { label: "Core Competencies",     key: "coreCompetencies" },
].filter(({ key }) => skills[key]?.some(Boolean)).map(({ label, key }) =>
  `<div class="skill-row"><span class="skill-label">${label}: </span>${skills[key].filter(Boolean).join(", ")}</div>`
).join("")}` : ""}

${education?.some((e) => e.institution) ? `
<div class="section-title">Education</div>
${education.filter((e) => e.institution).map((ed) => `
  <div class="edu-block">
    <div class="edu-row">
      <span class="edu-name">${ed.degree || ""}</span>
      <span class="edu-year">${ed.year || ""}</span>
    </div>
    <div class="edu-sub">${ed.institution || ""}${ed.location ? `, ${ed.location}` : ""}</div>
    ${ed.score ? `<div class="edu-sub">• ${ed.score}</div>` : ""}
  </div>`).join("")}` : ""}

${hackathons?.some(Boolean) ? `
<div class="section-title">Hackathon</div>
<div style="font-size:11px;color:#333">${hackathons.filter(Boolean).join(", ")}</div>` : ""}

${courses?.some(Boolean) ? `
<div class="section-title">Courses</div>
${courses.filter(Boolean).map((c) => `<div style="font-size:11px;color:#333">• ${c}</div>`).join("")}` : ""}

${languages?.some(Boolean) ? `
<div class="section-title">Languages</div>
<div style="font-size:11px;color:#333">${languages.filter(Boolean).join(", ")}</div>` : ""}

</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${personalInfo?.fullName || "resume"}.pdf"`,
    });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: "PDF generation failed", error: err.message });
  }
};

// Update module.exports to include downloadPDF
module.exports = { getResume, createResume, updateResume, downloadPDF };