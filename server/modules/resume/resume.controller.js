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
    const {
      personalInfo,
      education,
      experience,
      projects,
      skills,
      certifications,
    } = req.body;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', sans-serif; font-size: 13px; color: #111; padding: 44px 48px; line-height: 1.6; }
  h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .contact { font-size: 12px; color: #555; margin-top: 4px; }
  .links { font-size: 12px; color: #7C3AED; margin-top: 2px; }
  .summary { font-size: 13px; color: #444; margin-top: 10px; }
  .divider { border: none; border-top: 2px solid #111; margin: 14px 0; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #7C3AED; margin-bottom: 10px; }
  .section { margin-bottom: 18px; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 600; font-size: 14px; }
  .sub { font-size: 12px; color: #555; }
  .accent { font-size: 12px; color: #7C3AED; margin-bottom: 2px; }
  .date { font-size: 12px; color: #888; }
  .desc { font-size: 12px; color: #555; margin-top: 3px; }
  .skills-line { font-size: 13px; color: #333; }
  .item { margin-bottom: 10px; }
</style>
</head>
<body>

${personalInfo?.fullName ? `
<h1>${personalInfo.fullName}</h1>
<div class="contact">${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" · ")}</div>
${(personalInfo.linkedin || personalInfo.github || personalInfo.portfolio)
  ? `<div class="links">${[personalInfo.linkedin, personalInfo.github, personalInfo.portfolio].filter(Boolean).join(" · ")}</div>`
  : ""}
${personalInfo.summary ? `<div class="summary">${personalInfo.summary}</div>` : ""}
<hr class="divider" />
` : ""}

${education?.some(e => e.school) ? `
<div class="section">
  <div class="section-label">Education</div>
  ${education.filter(e => e.school).map(ed => `
    <div class="item">
      <div class="row">
        <span class="title">${ed.school}</span>
        <span class="date">${ed.startYear || ""}${ed.endYear ? " – " + ed.endYear : ""}</span>
      </div>
      <div class="sub">${[ed.degree, ed.fieldOfStudy].filter(Boolean).join(", ")}</div>
    </div>
  `).join("")}
</div>
` : ""}

${experience?.some(e => e.company) ? `
<div class="section">
  <div class="section-label">Experience</div>
  ${experience.filter(e => e.company).map(exp => `
    <div class="item">
      <div class="row">
        <span class="title">${exp.role}</span>
        <span class="date">${exp.startDate || ""}${exp.current ? " – Present" : exp.endDate ? " – " + exp.endDate : ""}</span>
      </div>
      <div class="accent">${exp.company}</div>
      ${exp.description ? `<div class="desc">${exp.description}</div>` : ""}
    </div>
  `).join("")}
</div>
` : ""}

${projects?.some(p => p.title) ? `
<div class="section">
  <div class="section-label">Projects</div>
  ${projects.filter(p => p.title).map(proj => `
    <div class="item">
      <div class="row">
        <span class="title">${proj.title}</span>
        ${proj.link ? `<span class="date">${proj.link}</span>` : ""}
      </div>
      ${proj.techStack?.length ? `<div class="accent">${Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack}</div>` : ""}
      ${proj.description ? `<div class="desc">${proj.description}</div>` : ""}
    </div>
  `).join("")}
</div>
` : ""}

${skills?.length ? `
<div class="section">
  <div class="section-label">Skills</div>
  <div class="skills-line">${skills.join(" · ")}</div>
</div>
` : ""}

${certifications?.some(c => c.name) ? `
<div class="section">
  <div class="section-label">Certifications</div>
  ${certifications.filter(c => c.name).map(cert => `
    <div class="item">
      <div class="row">
        <span class="title">${cert.name}</span>
        <span class="date">${[cert.issuer, cert.year].filter(Boolean).join(" · ")}</span>
      </div>
    </div>
  `).join("")}
</div>
` : ""}

</body>
</html>
`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${personalInfo?.fullName || "resume"}.pdf`,
    });

    res.send(pdf);
  } catch (err) {
    res.status(500).json({
      message: "PDF generation failed",
      error: err.message,
    });
  }
};

module.exports = { getResume, createResume, updateResume, downloadPDF };