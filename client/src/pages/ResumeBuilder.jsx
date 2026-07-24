import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, FolderOpen, Wrench,
  Plus, Trash2, Save, CheckCircle, Loader,
  AlertCircle, Download, Award, Globe,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const TABS = [
  { id: "personal",   label: "Personal",   icon: User },
  { id: "education",  label: "Education",  icon: GraduationCap },
  { id: "projects",   label: "Projects",   icon: FolderOpen },
  { id: "skills",     label: "Skills",     icon: Wrench },
  { id: "extras",     label: "Extras",     icon: Award },
];

const emptyEd   = () => ({ institution: "", degree: "", score: "", year: "", location: "" });
const emptyProj = () => ({ title: "", techStack: "", bullets: [""] });

function Field({ label, value, onChange, placeholder, rows }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="label" style={{ display: "block", marginBottom: 7 }}>{label}</label>
      {rows
        ? <textarea className="input" value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
        : <input className="input" value={value} onChange={onChange} placeholder={placeholder} />}
    </div>
  );
}

export default function ResumeBuilder() {
  const [tab, setTab]         = useState("personal");
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");
  const [downloading, setDownloading] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "", email: "", phone: "",
    github: "", leetcode: "", linkedin: "", about: "",
  });
  const [education,  setEducation]  = useState([emptyEd()]);
  const [projects,   setProjects]   = useState([emptyProj()]);
  const [skills, setSkills] = useState({
    languages: [""],
    frameworks: [""],
    developerTools: [""],
    coreCompetencies: [""],
  });
  const [hackathons, setHackathons] = useState([""]);
  const [courses,    setCourses]    = useState([""]);
  const [languages,  setLanguages]  = useState([""]);

  useEffect(() => {
    axios.get("/resume", { headers: authHeader() })
      .then(({ data }) => {
        const r = data.resume;
        if (r.personalInfo) setPersonalInfo({ ...personalInfo, ...r.personalInfo });
        if (r.education?.length)  setEducation(r.education);
        if (r.projects?.length)   setProjects(r.projects.map((p) => ({ ...p, techStack: p.techStack?.join(", ") || "" })));
        if (r.skills?.languages)  setSkills(r.skills);
        if (r.hackathons?.length) setHackathons(r.hackathons);
        if (r.courses?.length)    setCourses(r.courses);
        if (r.languages?.length)  setLanguages(r.languages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError("");
    try {
      await axios.put("/resume", {
        personalInfo,
        education,
        projects: projects.map((p) => ({
          ...p,
          techStack: typeof p.techStack === "string"
            ? p.techStack.split(",").map((s) => s.trim()).filter(Boolean)
            : p.techStack,
          bullets: p.bullets.filter(Boolean),
        })),
        skills,
        hackathons: hackathons.filter(Boolean),
        courses:    courses.filter(Boolean),
        languages:  languages.filter(Boolean),
      }, { headers: authHeader() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const body = {
        personalInfo,
        education,
        projects: projects.map((p) => ({
          ...p,
          techStack: typeof p.techStack === "string"
            ? p.techStack.split(",").map((s) => s.trim()).filter(Boolean)
            : p.techStack,
          bullets: p.bullets.filter(Boolean),
        })),
        skills,
        hackathons: hackathons.filter(Boolean),
        courses:    courses.filter(Boolean),
        languages:  languages.filter(Boolean),
      };
      const res = await axios.post("/resume/download-pdf", body, {
        headers: authHeader(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href    = url;
      a.download = `${personalInfo.fullName || "resume"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("PDF download failed. Make sure Puppeteer is installed on server.");
    } finally { setDownloading(false); }
  };

  const updList = (setter, i, key, val) =>
    setter((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const updBullet = (projIdx, bulletIdx, val) =>
    setProjects((prev) => prev.map((p, i) => i !== projIdx ? p : {
      ...p,
      bullets: p.bullets.map((b, bi) => bi === bulletIdx ? val : b),
    }));

  const addBullet = (projIdx) =>
    setProjects((prev) => prev.map((p, i) => i !== projIdx ? p : { ...p, bullets: [...p.bullets, ""] }));

  const removeBullet = (projIdx, bulletIdx) =>
    setProjects((prev) => prev.map((p, i) => i !== projIdx ? p : {
      ...p, bullets: p.bullets.filter((_, bi) => bi !== bulletIdx),
    }));

  const updSkill = (key, idx, val) =>
    setSkills((prev) => ({
      ...prev,
      [key]: prev[key].map((s, i) => i === idx ? val : s),
    }));

  const addSkill    = (key) => setSkills((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  const removeSkill = (key, idx) =>
    setSkills((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  const updSimpleList = (setter, idx, val) =>
    setter((prev) => prev.map((item, i) => i === idx ? val : item));
  const addSimple    = (setter) => setter((prev) => [...prev, ""]);
  const removeSimple = (setter, idx) => setter((prev) => prev.filter((_, i) => i !== idx));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader size={24} color="#5B6EF5" className="animate-spin" />
    </div>
  );

  // ── Live Preview ──
  const Preview = () => (
    <div style={{
      fontFamily: "Arial, sans-serif", fontSize: 12,
      color: "#111", background: "#fff",
      padding: "36px 40px", lineHeight: 1.55,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12, borderBottom: "2px solid #111", paddingBottom: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.02em" }}>
          {personalInfo.fullName || "Your Name"}
        </div>
        <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
          {[personalInfo.email, personalInfo.phone].filter(Boolean).join("  |  ")}
        </div>
        <div style={{ fontSize: 11, color: "#1a56db", marginTop: 3 }}>
          {[
            personalInfo.github && `Github: ${personalInfo.github}`,
            personalInfo.leetcode && `Leetcode: ${personalInfo.leetcode}`,
            personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
          ].filter(Boolean).join("  |  ")}
        </div>
      </div>

      {/* About */}
      {personalInfo.about && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            About Me
          </div>
          <p style={{ fontSize: 11, color: "#333" }}>{personalInfo.about}</p>
        </div>
      )}

      {/* Projects */}
      {projects.some((p) => p.title) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Projects
          </div>
          {projects.filter((p) => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                {proj.title}
                {proj.techStack && (
                  <span style={{ fontWeight: 400, color: "#444" }}>
                    {" | "}{typeof proj.techStack === "string" ? proj.techStack : proj.techStack.join(", ")}
                  </span>
                )}
              </div>
              {proj.bullets?.filter(Boolean).map((b, bi) => (
                <div key={bi} style={{ fontSize: 11, color: "#333", paddingLeft: 12, marginTop: 2 }}>
                  • {b}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {Object.values(skills).some((arr) => arr.some(Boolean)) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Skills
          </div>
          {[
            { label: "Languages",         key: "languages" },
            { label: "Frameworks & Libraries", key: "frameworks" },
            { label: "Developer Tools",   key: "developerTools" },
            { label: "Core Competencies", key: "coreCompetencies" },
          ].map(({ label, key }) => skills[key]?.some(Boolean) && (
            <div key={key} style={{ fontSize: 11, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{label}: </span>
              <span style={{ color: "#333" }}>{skills[key].filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.some((e) => e.institution) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Education
          </div>
          {education.filter((e) => e.institution).map((ed, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 12 }}>{ed.degree}</span>
                <span style={{ fontSize: 11, color: "#555" }}>{ed.year}</span>
              </div>
              <div style={{ fontSize: 11, color: "#444" }}>
                {ed.institution}{ed.location ? `, ${ed.location}` : ""}
              </div>
              {ed.score && <div style={{ fontSize: 11, color: "#444" }}>• {ed.score}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Hackathons */}
      {hackathons.some(Boolean) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Hackathon
          </div>
          <div style={{ fontSize: 11, color: "#333" }}>{hackathons.filter(Boolean).join(", ")}</div>
        </div>
      )}

      {/* Courses */}
      {courses.some(Boolean) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Courses
          </div>
          {courses.filter(Boolean).map((c, i) => (
            <div key={i} style={{ fontSize: 11, color: "#333" }}>• {c}</div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.some(Boolean) && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 6 }}>
            Languages
          </div>
          <div style={{ fontSize: 11, color: "#333" }}>{languages.filter(Boolean).join(", ")}</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "#080C18", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Navbar />
      <div className="orb orb-blue"   style={{ width: 400, height: 400, top: -100, left: -100, opacity: 0.15 }} />
      <div className="orb orb-purple" style={{ width: 350, height: 350, bottom: -100, right: -100, opacity: 0.1 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 24px 40px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>Resume Builder</p>
            <h1 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.02em", color: "#F0F4FF" }}>
              Build your resume
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={downloadPDF} disabled={downloading || !personalInfo.fullName}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
              {downloading ? <><Loader size={13} className="animate-spin" /> Generating…</> : <><Download size={13} /> Download PDF</>}
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
              {saving  ? <><Loader size={13} className="animate-spin" /> Saving…</>
               : saved ? <><CheckCircle size={13} /> Saved!</>
               :          <><Save size={13} /> Save</>}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#F87171", marginBottom: 16,
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Form */}
          <div>
            {/* Tabs */}
            <div style={{
              display: "flex", gap: 2, flexWrap: "wrap",
              background: "rgba(15,22,40,0.8)", border: "1px solid #1E2A45",
              borderRadius: 12, padding: 4, marginBottom: 16,
            }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, fontFamily: "Inter",
                  background: tab === t.id
                    ? "linear-gradient(135deg, #5B6EF5, #7C5BF5)"
                    : "transparent",
                  color: tab === t.id ? "#fff" : "#6B7A99",
                  transition: "all 0.15s",
                  boxShadow: tab === t.id ? "0 0 12px rgba(91,110,245,0.3)" : "none",
                }}>
                  <t.icon size={12} /> {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {/* PERSONAL */}
                {tab === "personal" && (
                  <div className="glass" style={{ padding: 22 }}>
                    <p style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF", marginBottom: 18 }}>
                      Personal Information
                    </p>
                    <Field label="Full Name"   value={personalInfo.fullName}  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}   placeholder="Shambhavi Mishra" />
                    <Field label="Email"       value={personalInfo.email}     onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}       placeholder="you@example.com" />
                    <Field label="Phone"       value={personalInfo.phone}     onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}       placeholder="8810252897" />
                    <Field label="GitHub URL"  value={personalInfo.github}    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}      placeholder="github.com/yourname" />
                    <Field label="LeetCode URL" value={personalInfo.leetcode} onChange={(e) => setPersonalInfo({ ...personalInfo, leetcode: e.target.value })}    placeholder="leetcode.com/yourname" />
                    <Field label="LinkedIn URL" value={personalInfo.linkedin} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}    placeholder="linkedin.com/in/yourname" />
                    <Field label="About Me"    value={personalInfo.about}     onChange={(e) => setPersonalInfo({ ...personalInfo, about: e.target.value })}       placeholder="Brief intro about yourself…" rows={4} />
                  </div>
                )}

                {/* EDUCATION */}
                {tab === "education" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {education.map((ed, i) => (
                      <div key={i} className="glass" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF" }}>
                            Education {i + 1}
                          </span>
                          {education.length > 1 && (
                            <button onClick={() => setEducation((prev) => prev.filter((_, idx) => idx !== i))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <Field label="Institution" value={ed.institution} onChange={(e) => updList(setEducation, i, "institution", e.target.value)} placeholder="BHAGWANPARSHURAM INSTITUTE OF TECHNOLOGY" />
                        <Field label="Degree"      value={ed.degree}      onChange={(e) => updList(setEducation, i, "degree", e.target.value)}      placeholder="Bachelor's in Technology (CSE)" />
                        <Field label="Score/CGPA"  value={ed.score}       onChange={(e) => updList(setEducation, i, "score", e.target.value)}       placeholder="CGPA - 8.412" />
                        <Field label="Year"        value={ed.year}        onChange={(e) => updList(setEducation, i, "year", e.target.value)}        placeholder="2023 – 2027" />
                        <Field label="Location"    value={ed.location}    onChange={(e) => updList(setEducation, i, "location", e.target.value)}    placeholder="Delhi" />
                      </div>
                    ))}
                    <button className="btn-ghost"
                      onClick={() => setEducation((prev) => [...prev, emptyEd()])}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}>
                      <Plus size={14} /> Add education
                    </button>
                  </div>
                )}

                {/* PROJECTS */}
                {tab === "projects" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {projects.map((proj, pi) => (
                      <div key={pi} className="glass" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF" }}>
                            Project {pi + 1}
                          </span>
                          {projects.length > 1 && (
                            <button onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== pi))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <Field label="Project Title" value={proj.title} onChange={(e) => updList(setProjects, pi, "title", e.target.value)} placeholder="LinKsy" />
                        <Field label="Tech Stack (comma separated)" value={proj.techStack} onChange={(e) => updList(setProjects, pi, "techStack", e.target.value)} placeholder="MERN, Socket.io, Redis, JWT" />

                        <label className="label" style={{ display: "block", marginBottom: 10 }}>Bullet Points</label>
                        {proj.bullets.map((b, bi) => (
                          <div key={bi} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                              className="input"
                              value={b}
                              onChange={(e) => updBullet(pi, bi, e.target.value)}
                              placeholder={`• Bullet point ${bi + 1}`}
                            />
                            {proj.bullets.length > 1 && (
                              <button onClick={() => removeBullet(pi, bi)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="btn-ghost"
                          onClick={() => addBullet(pi)}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}>
                          <Plus size={12} /> Add bullet
                        </button>
                      </div>
                    ))}
                    <button className="btn-ghost"
                      onClick={() => setProjects((prev) => [...prev, emptyProj()])}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}>
                      <Plus size={14} /> Add project
                    </button>
                  </div>
                )}

                {/* SKILLS */}
                {tab === "skills" && (
                  <div className="glass" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
                    <p style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF" }}>Skills</p>
                    {[
                      { key: "languages",         label: "Languages",             placeholder: "Java, C++, Python, JavaScript" },
                      { key: "frameworks",        label: "Frameworks & Libraries", placeholder: "Node.js, Express.js, React, Socket.io" },
                      { key: "developerTools",    label: "Developer Tools",        placeholder: "Git, Postman, MongoDB, MySQL" },
                      { key: "coreCompetencies",  label: "Core Competencies",      placeholder: "DSA, OOP, OS, DBMS, Computer Networks" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="label" style={{ display: "block", marginBottom: 10 }}>{label}</label>
                        {skills[key].map((s, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input className="input" value={s}
                              onChange={(e) => updSkill(key, idx, e.target.value)}
                              placeholder={placeholder} />
                            {skills[key].length > 1 && (
                              <button onClick={() => removeSkill(key, idx)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="btn-ghost"
                          onClick={() => addSkill(key)}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}>
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXTRAS */}
                {tab === "extras" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Hackathons */}
                    <div className="glass" style={{ padding: 22 }}>
                      <p style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF", marginBottom: 14 }}>Hackathons</p>
                      {hackathons.map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input className="input" value={h}
                            onChange={(e) => updSimpleList(setHackathons, i, e.target.value)}
                            placeholder="SIH 2025" />
                          {hackathons.length > 1 && (
                            <button onClick={() => removeSimple(setHackathons, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button className="btn-ghost" onClick={() => addSimple(setHackathons)}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}>
                        <Plus size={12} /> Add hackathon
                      </button>
                    </div>

                    {/* Courses */}
                    <div className="glass" style={{ padding: 22 }}>
                      <p style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF", marginBottom: 14 }}>Courses</p>
                      {courses.map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input className="input" value={c}
                            onChange={(e) => updSimpleList(setCourses, i, e.target.value)}
                            placeholder="Samsung Innovation Campus (SIC) - 2025" />
                          {courses.length > 1 && (
                            <button onClick={() => removeSimple(setCourses, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button className="btn-ghost" onClick={() => addSimple(setCourses)}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}>
                        <Plus size={12} /> Add course
                      </button>
                    </div>

                    {/* Languages */}
                    <div className="glass" style={{ padding: 22 }}>
                      <p style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "#F0F4FF", marginBottom: 14 }}>Languages Known</p>
                      {languages.map((l, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input className="input" value={l}
                            onChange={(e) => updSimpleList(setLanguages, i, e.target.value)}
                            placeholder="English" />
                          {languages.length > 1 && (
                            <button onClick={() => removeSimple(setLanguages, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", flexShrink: 0 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button className="btn-ghost" onClick={() => addSimple(setLanguages)}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px" }}>
                        <Plus size={12} /> Add language
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview */}
          <div style={{ position: "sticky", top: 90, height: "fit-content" }}>
            <div style={{ border: "1px solid #1E2A45", borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                background: "rgba(15,22,40,0.9)", padding: "10px 16px",
                borderBottom: "1px solid #1E2A45",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 11, color: "#3D4F6E", marginLeft: 6 }}>
                  {personalInfo.fullName || "resume"}.pdf
                </span>
              </div>
              <div style={{ maxHeight: "78vh", overflowY: "auto" }}>
                <Preview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}