import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Briefcase, FolderOpen,
  Wrench, Award, Plus, Trash2, Save,
  CheckCircle, Loader, AlertCircle, Download,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const TABS = [
  { id: "personal",        label: "Personal",        icon: User },
  { id: "education",       label: "Education",       icon: GraduationCap },
  { id: "experience",      label: "Experience",      icon: Briefcase },
  { id: "projects",        label: "Projects",        icon: FolderOpen },
  { id: "skills",          label: "Skills",          icon: Wrench },
  { id: "certifications",  label: "Certifications",  icon: Award },
];

const emptyEd   = () => ({ school: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" });
const emptyExp  = () => ({ company: "", role: "", startDate: "", endDate: "", current: false, description: "" });
const emptyProj = () => ({ title: "", description: "", techStack: "", link: "" });
const emptyCert = () => ({ name: "", issuer: "", year: "" });

/* ── Labelled input ── */
function Field({ label, value, onChange, placeholder, type = "text", rows }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="mono" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      {rows
        ? <textarea className="input" value={value} onChange={onChange}
            placeholder={placeholder} rows={rows} />
        : <input className="input" type={type} value={value}
            onChange={onChange} placeholder={placeholder} />}
    </div>
  );
}

export default function ResumeBuilder() {
  const [tab, setTab]     = useState("personal");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "", email: "", phone: "", location: "",
    linkedin: "", github: "", portfolio: "", summary: "",
  });
  const [education,      setEducation]      = useState([emptyEd()]);
  const [experience,     setExperience]     = useState([emptyExp()]);
  const [projects,       setProjects]       = useState([emptyProj()]);
  const [skills,         setSkills]         = useState([]);
  const [certifications, setCertifications] = useState([emptyCert()]);

  /* ── Load saved resume ── */
  useEffect(() => {
    axios.get("/resume", { headers: authHeader() })
      .then(({ data }) => {
        const r = data.resume;
        if (r.personalInfo) setPersonalInfo(r.personalInfo);
        if (r.education?.length)      setEducation(r.education);
        if (r.experience?.length)     setExperience(r.experience);
        if (r.projects?.length)
          setProjects(r.projects.map((p) => ({ ...p, techStack: p.techStack?.join(", ") || "" })));
        if (r.skills?.length)         setSkills(r.skills);
        if (r.certifications?.length) setCertifications(r.certifications);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setError("");
    try {
      await axios.put("/resume", {
        personalInfo, education, experience,
        projects: projects.map((p) => ({
          ...p,
          techStack: p.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        })),
        skills, certifications,
      }, { headers: authHeader() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  /* ── PDF download via server ── */
  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const resumeData = {
        personalInfo, education, experience,
        projects: projects.map((p) => ({
          ...p,
          techStack: p.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        })),
        skills, certifications,
      };
      const response = await axios.post("/resume/download-pdf", resumeData, {
        headers: authHeader(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href    = url;
      a.download = `${personalInfo.fullName || "resume"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("PDF download failed. Make sure Puppeteer is installed.");
    } finally { setDownloading(false); }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = skillInput.trim().replace(",", "");
      if (v && !skills.includes(v)) setSkills([...skills, v]);
      setSkillInput("");
    }
  };

  const upd  = (setter, i, key, val) => setter((p) => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it));
  const add  = (setter, empty) => setter((p) => [...p, empty()]);
  const rem  = (setter, i)     => setter((p) => p.filter((_, idx) => idx !== i));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader size={24} color="#A78BFA" className="animate-spin" />
    </div>
  );

  /* ── Preview HTML ── */
  const preview = (
    <div ref={previewRef} id="resume-preview" style={{
      fontFamily: "Inter, sans-serif", fontSize: 13,
      color: "#111", background: "#fff",
      padding: "40px 44px", lineHeight: 1.6,
      minHeight: 500,
    }}>
      {/* Header */}
      {personalInfo.fullName && (
        <div style={{ borderBottom: "2px solid #111", paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 26 }}>
            {personalInfo.fullName}
          </div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join("  ·  ")}
          </div>
          {(personalInfo.linkedin || personalInfo.github || personalInfo.portfolio) && (
            <div style={{ fontSize: 12, color: "#7C3AED", marginTop: 2 }}>
              {[personalInfo.linkedin, personalInfo.github, personalInfo.portfolio].filter(Boolean).join("  ·  ")}
            </div>
          )}
          {personalInfo.summary && (
            <p style={{ fontSize: 13, color: "#444", marginTop: 10, lineHeight: 1.65 }}>
              {personalInfo.summary}
            </p>
          )}
        </div>
      )}

      {/* Education */}
      {education.some((e) => e.school) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 8 }}>
            Education
          </div>
          {education.filter((e) => e.school).map((ed, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{ed.school}</span>
                <span style={{ fontSize: 12, color: "#888" }}>{ed.startYear}{ed.endYear ? ` – ${ed.endYear}` : ""}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.some((e) => e.company) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 8 }}>
            Experience
          </div>
          {experience.filter((e) => e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{exp.role}</span>
                <span style={{ fontSize: 12, color: "#888" }}>
                  {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#7C3AED", marginBottom: 4 }}>{exp.company}</div>
              {exp.description && <p style={{ fontSize: 12, color: "#555" }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.some((p) => p.title) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 8 }}>
            Projects
          </div>
          {projects.filter((p) => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{proj.title}</span>
                {proj.link && <span style={{ fontSize: 11, color: "#888" }}>{proj.link}</span>}
              </div>
              {proj.techStack && <div style={{ fontSize: 11, color: "#7C3AED", marginBottom: 2 }}>{proj.techStack}</div>}
              {proj.description && <p style={{ fontSize: 12, color: "#555" }}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 8 }}>
            Skills
          </div>
          <div style={{ fontSize: 13, color: "#333" }}>{skills.join("  ·  ")}</div>
        </div>
      )}

      {/* Certifications */}
      {certifications.some((c) => c.name) && (
        <div>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 8 }}>
            Certifications
          </div>
          {certifications.filter((c) => c.name).map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{cert.name}</span>
              <span style={{ color: "#888", fontSize: 12 }}>{[cert.issuer, cert.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <span className="mono">Resume Builder</span>
            <h1 style={{
              fontFamily: "Sora", fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 36px)",
              letterSpacing: "-0.025em", color: "var(--text)", marginTop: 8,
            }}>
              Build your resume
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={downloadPDF}
              disabled={downloading || !personalInfo.fullName}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 13 }}
            >
              {downloading
                ? <><Loader size={13} className="animate-spin" /> Generating…</>
                : <><Download size={13} /> Download PDF</>}
            </button>
            <button
              className="btn-primary"
              onClick={save}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 13 }}
            >
              {saving   ? <><Loader size={13} className="animate-spin" /> Saving…</>
               : saved  ? <><CheckCircle size={13} /> Saved!</>
               : <><Save size={13} /> Save</>}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#EF444412", border: "1px solid #EF444428",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 13, color: "#F87171", marginBottom: 16,
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── Form side ── */}
          <div>
            {/* Tabs */}
            <div style={{
              display: "flex", gap: 2, flexWrap: "wrap",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 4, marginBottom: 16,
              position: "relative",
            }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, fontFamily: "Inter",
                  background: tab === t.id ? "var(--border)" : "transparent",
                  color: tab === t.id ? "var(--text)" : "var(--muted)",
                  transition: "all 0.15s",
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
                  <div className="card" style={{ padding: 22 }}>
                    {[
                      { key: "fullName",  label: "Full Name",    placeholder: "John Doe" },
                      { key: "email",     label: "Email",        placeholder: "john@example.com" },
                      { key: "phone",     label: "Phone",        placeholder: "+91 9876543210" },
                      { key: "location",  label: "Location",     placeholder: "Delhi, India" },
                      { key: "linkedin",  label: "LinkedIn",     placeholder: "linkedin.com/in/johndoe" },
                      { key: "github",    label: "GitHub",       placeholder: "github.com/johndoe" },
                      { key: "portfolio", label: "Portfolio",    placeholder: "johndoe.dev" },
                    ].map((f) => (
                      <Field key={f.key} label={f.label} placeholder={f.placeholder}
                        value={personalInfo[f.key]}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, [f.key]: e.target.value })} />
                    ))}
                    <Field label="Summary" placeholder="Brief professional summary…"
                      rows={4} value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} />
                  </div>
                )}

                {/* EDUCATION */}
                {tab === "education" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {education.map((ed, i) => (
                      <div key={i} className="card" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                            Education {i + 1}
                          </span>
                          {education.length > 1 && (
                            <button onClick={() => rem(setEducation, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {[
                          { key: "school",       label: "School",        placeholder: "Delhi University" },
                          { key: "degree",       label: "Degree",        placeholder: "B.Tech" },
                          { key: "fieldOfStudy", label: "Field",         placeholder: "Computer Science" },
                          { key: "startYear",    label: "Start Year",    placeholder: "2021" },
                          { key: "endYear",      label: "End Year",      placeholder: "2025" },
                        ].map((f) => (
                          <Field key={f.key} label={f.label} placeholder={f.placeholder}
                            value={ed[f.key]} onChange={(e) => upd(setEducation, i, f.key, e.target.value)} />
                        ))}
                      </div>
                    ))}
                    <button className="btn-ghost" onClick={() => add(setEducation, emptyEd)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Plus size={14} /> Add education
                    </button>
                  </div>
                )}

                {/* EXPERIENCE */}
                {tab === "experience" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {experience.map((exp, i) => (
                      <div key={i} className="card" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                            Experience {i + 1}
                          </span>
                          {experience.length > 1 && (
                            <button onClick={() => rem(setExperience, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {[
                          { key: "company",   label: "Company",    placeholder: "Google" },
                          { key: "role",      label: "Role",       placeholder: "SWE Intern" },
                          { key: "startDate", label: "Start Date", placeholder: "June 2024" },
                        ].map((f) => (
                          <Field key={f.key} label={f.label} placeholder={f.placeholder}
                            value={exp[f.key]} onChange={(e) => upd(setExperience, i, f.key, e.target.value)} />
                        ))}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <input type="checkbox" id={`cur-${i}`} checked={exp.current}
                            onChange={(e) => upd(setExperience, i, "current", e.target.checked)}
                            style={{ accentColor: "var(--accent)", width: 14, height: 14 }} />
                          <label htmlFor={`cur-${i}`} style={{ fontSize: 13, color: "var(--muted)" }}>
                            Currently working here
                          </label>
                        </div>
                        {!exp.current && (
                          <Field label="End Date" placeholder="August 2024"
                            value={exp.endDate} onChange={(e) => upd(setExperience, i, "endDate", e.target.value)} />
                        )}
                        <Field label="Description" placeholder="Describe your work…"
                          rows={3} value={exp.description}
                          onChange={(e) => upd(setExperience, i, "description", e.target.value)} />
                      </div>
                    ))}
                    <button className="btn-ghost" onClick={() => add(setExperience, emptyExp)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Plus size={14} /> Add experience
                    </button>
                  </div>
                )}

                {/* PROJECTS */}
                {tab === "projects" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {projects.map((proj, i) => (
                      <div key={i} className="card" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                            Project {i + 1}
                          </span>
                          {projects.length > 1 && (
                            <button onClick={() => rem(setProjects, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {[
                          { key: "title",     label: "Title",          placeholder: "Resume Builder API" },
                          { key: "techStack", label: "Tech (comma sep)", placeholder: "Node.js, Express, MongoDB" },
                          { key: "link",      label: "Link",           placeholder: "github.com/you/project" },
                        ].map((f) => (
                          <Field key={f.key} label={f.label} placeholder={f.placeholder}
                            value={proj[f.key]} onChange={(e) => upd(setProjects, i, f.key, e.target.value)} />
                        ))}
                        <Field label="Description" placeholder="What did you build?"
                          rows={3} value={proj.description}
                          onChange={(e) => upd(setProjects, i, "description", e.target.value)} />
                      </div>
                    ))}
                    <button className="btn-ghost" onClick={() => add(setProjects, emptyProj)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Plus size={14} /> Add project
                    </button>
                  </div>
                )}

                {/* SKILLS */}
                {tab === "skills" && (
                  <div className="card" style={{ padding: 22 }}>
                    <label className="mono" style={{ display: "block", marginBottom: 6 }}>
                      Type skill, press Enter or comma
                    </label>
                    <input className="input" value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill} placeholder="e.g. Node.js"
                      style={{ marginBottom: 14 }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {skills.map((s) => (
                        <span key={s} className="badge badge-violet" style={{ cursor: "default" }}>
                          {s}
                          <button onClick={() => setSkills(skills.filter((sk) => sk !== s))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: 2 }}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CERTIFICATIONS */}
                {tab === "certifications" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {certifications.map((cert, i) => (
                      <div key={i} className="card" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                            Certification {i + 1}
                          </span>
                          {certifications.length > 1 && (
                            <button onClick={() => rem(setCertifications, i)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {[
                          { key: "name",   label: "Name",         placeholder: "AWS Certified Developer" },
                          { key: "issuer", label: "Issuer",       placeholder: "Amazon Web Services" },
                          { key: "year",   label: "Year",         placeholder: "2024" },
                        ].map((f) => (
                          <Field key={f.key} label={f.label} placeholder={f.placeholder}
                            value={cert[f.key]} onChange={(e) => upd(setCertifications, i, f.key, e.target.value)} />
                        ))}
                      </div>
                    ))}
                    <button className="btn-ghost" onClick={() => add(setCertifications, emptyCert)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Plus size={14} /> Add certification
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Preview side ── */}
          <div style={{ position: "sticky", top: 90, height: "fit-content" }}>
            <div style={{
              border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{
                background: "var(--surface)", padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 6, fontFamily: "JetBrains Mono" }}>
                  resume-preview.pdf
                </span>
              </div>
              <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {preview}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}