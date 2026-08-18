import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Sparkles, Target,
  CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Loader, Zap,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ── Score Ring ── */
function ScoreRing({ score }) {
  const R = 54, SW = 8;
  const circ  = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  const label  = score >= 75 ? "Strong" : score >= 50 ? "Average" : "Weak";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={120} height={120} style={{ overflow: "visible" }}>
        <circle cx={60} cy={60} r={R} fill="none" stroke="var(--border)" strokeWidth={SW} />
        <circle
          cx={60} cy={60} r={R}
          fill="none" stroke={color} strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="score-ring"
        />
        <text x={60} y={55} textAnchor="middle"
          style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 28, fill: "var(--text)" }}>
          {score}
        </text>
        <text x={60} y={73} textAnchor="middle"
          style={{ fontFamily: "JetBrains Mono", fontSize: 10, fill: "var(--muted)", letterSpacing: "0.05em" }}>
          ATS SCORE
        </text>
      </svg>
      <span className="badge" style={{
        background: color + "20", color, border: `1px solid ${color}30`, fontSize: 11,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ── Collapsible panel ── */
function Panel({ title, icon: Icon, iconColor = "#A78BFA", defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "18px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon size={16} color={iconColor} />
          <span style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp size={16} color="var(--muted)" />
          : <ChevronDown size={16} color="var(--muted)" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 22px 22px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Progress bar ── */
function Bar({ label, val, max }) {
  const pct = Math.round((val / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--muted)" }}>
          {val} / {max}
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Analyzer() {
  const [file, setFile]             = useState(null);
  const [step, setStep]             = useState("upload");
  const [loading, setLoading]       = useState(false);
  const [loadMsg, setLoadMsg]       = useState("");
  const [error, setError]           = useState("");
  const [resumeText, setResumeText] = useState("");
  const [atsResult, setAtsResult]   = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [jobDesc, setJobDesc]       = useState("");
  const [aiLoaded, setAiLoaded]     = useState(false);

  const onDrop = useCallback((files) => {
    if (files[0]) { setFile(files[0]); setError(""); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const analyze = async () => {
    if (!file) return setError("Upload a resume first");
    setLoading(true); setError("");
    setLoadMsg("Parsing resume…");
    const fd = new FormData();
    fd.append("resume", file);
    try {
      setLoadMsg("Calculating ATS score…");
      const { data } = await axios.post("/analyze/ats", fd, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });
      setResumeText(data.resumeText);
      setAtsResult(data.atsResult);
      setStep("results");
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally { setLoading(false); }
  };

  const matchJob = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true); setLoadMsg("Matching keywords…");
    try {
      const { data } = await axios.post(
        "/analyze/match",
        { resumeText, jobDescription: jobDesc },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      setMatchResult(data);
    } catch { setError("Job match failed"); }
    finally { setLoading(false); }
  };

  const getAI = async () => {
    if (aiLoaded) return;
    setLoading(true); setLoadMsg("Groq AI is reading your resume…");
    try {
      const { data } = await axios.post(
        "/analyze/ai-feedback",
        { resumeText, atsResult },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      setAiFeedback(data.feedback);
      setAiLoaded(true);
    } catch { setError("AI feedback failed"); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setFile(null); setStep("upload"); setResumeText(""); setAtsResult(null);
    setMatchResult(null); setAiFeedback(null); setJobDesc(""); setAiLoaded(false); setError("");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "100px 24px 60px" }}>
        <AnimatePresence mode="wait">

          {/* ── UPLOAD ── */}
          {step === "upload" && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 40 }}>
                <span className="mono">Resume Analyzer</span>
                <h1 style={{
                  fontFamily: "Sora", fontWeight: 700,
                  fontSize: "clamp(28px, 5vw, 44px)",
                  letterSpacing: "-0.025em", color: "var(--text)", marginTop: 10,
                }}>
                  Upload your resume
                </h1>
                <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8 }}>
                  No sign-in required. PDF or DOCX, up to 5 MB.
                </p>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className="card"
                style={{
                  padding: "64px 32px", textAlign: "center", cursor: "pointer",
                  borderStyle: "dashed",
                  borderColor: isDragActive ? "var(--accent)" : "var(--border)",
                  background: isDragActive ? "#7C3AED08" : "var(--surface)",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <input {...getInputProps()} />
                <motion.div animate={isDragActive ? { scale: 1.04 } : { scale: 1 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: "var(--border)", margin: "0 auto 16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Upload size={22} color="#A78BFA" />
                  </div>
                  {file ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <FileText size={18} color="#A78BFA" />
                      <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{file.name}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 15, marginBottom: 6 }}>
                        {isDragActive ? "Drop here" : "Drag & drop your resume"}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>
                        or click to browse · PDF and DOCX supported
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#EF444412", border: "1px solid #EF444428",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 13, color: "#F87171", marginTop: 12,
                }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={analyze}
                disabled={loading || !file}
                style={{
                  width: "100%", marginTop: 14, padding: "14px",
                  fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading
                  ? <><Loader size={16} className="animate-spin" /> {loadMsg}</>
                  : <><Zap size={16} /> Analyze resume</>}
              </button>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && atsResult && (
            <motion.div key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span className="mono">Analysis complete</span>
                  <h1 style={{
                    fontFamily: "Sora", fontWeight: 700, fontSize: 28,
                    letterSpacing: "-0.02em", color: "var(--text)", marginTop: 6,
                  }}>
                    Your results
                  </h1>
                  <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{file?.name}</p>
                </div>
                <button className="btn-ghost" onClick={reset}
                  style={{ padding: "8px 14px", fontSize: 13 }}>
                  ← New upload
                </button>
              </div>

             {/* Score overview */}
<motion.div
  className="card"
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  style={{
    padding: "32px 28px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 36,
    alignItems: "center",
    background: "rgba(15, 22, 40, 0.9)",
    border: "1px solid rgba(91,110,245,0.2)",
    boxShadow: "0 0 60px rgba(91,110,245,0.06)",
  }}
>
  {/* <ScoreRing score={atsResult.score} /> */}

<div
  style={{
    color: "#FFFFFF",
    textShadow:
      "0 0 8px rgba(255,255,255,0.9), 0 0 18px rgba(255,255,255,0.7), 0 0 35px rgba(255,255,255,0.5)",
  }}
>
  <ScoreRing score={atsResult.score} />
</div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {[
      {
        label: "Sections found",
        value: atsResult.sectionsFound?.length ?? 0,
        color: "#818CF8",
        glow: "rgba(129,140,248,0.35)",
      },
      {
        label: "Sections missing",
        value: atsResult.missingSections?.length ?? 0,
        color: "#F87171",
        glow: "rgba(248,113,113,0.35)",
      },
      {
        label: "Keywords matched",
        value: atsResult.keywordsFound?.length ?? 0,
        color: "#34D399",
        glow: "rgba(52,211,153,0.35)",
      },
      {
        label: "Action verbs",
        value: atsResult.actionVerbsFound?.length ?? 0,
        color: "#FCD34D",
        glow: "rgba(252,211,77,0.35)",
      },
    ].map((stat, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + i * 0.07 }}
        style={{
          padding: "18px 20px",
          background: "rgba(20, 27, 45, 0.8)",
          border: `1px solid ${stat.color}25`,
          borderRadius: 14,
          boxShadow: `0 0 24px ${stat.glow}20, inset 0 0 20px ${stat.glow}08`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow background blob */}
        <div style={{
          position: "absolute",
          top: -20, right: -20,
          width: 80, height: 80,
          borderRadius: "50%",
          background: stat.color,
          filter: "blur(40px)",
          opacity: 0.15,
          pointerEvents: "none",
        }} />

        <div style={{
          fontFamily: "Sora",
          fontWeight: 800,
          fontSize: 42,
          color: stat.color,
          lineHeight: 1,
          marginBottom: 6,
          textShadow: `0 0 20px ${stat.color}, 0 0 40px ${stat.glow}`,
          letterSpacing: "-0.02em",
        }}>
          {stat.value}
        </div>
        <div style={{
          fontSize: 12,
          color: "#6B7A99",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}>
          {stat.label}
        </div>
      </motion.div>
    ))}
  </div>
</motion.div>

              {/* ATS breakdown */}
              <Panel title="ATS Breakdown" icon={Zap} defaultOpen>
                <div style={{ marginBottom: 20 }}>
                  {atsResult.breakdown && Object.entries(atsResult.breakdown).map(([key, val]) => {
                    const maxMap = { sections: 30, keywords: 25, actionVerbs: 20, length: 15, contactInfo: 10 };
                    const labelMap = { sections: "Sections", keywords: "Keywords", actionVerbs: "Action Verbs", length: "Length", contactInfo: "Contact Info" };
                    return <Bar key={key} label={labelMap[key] || key} val={val} max={maxMap[key] || 10} />;
                  })}
                </div>

                <hr className="divider" style={{ marginBottom: 16 }} />

                <p className="mono" style={{ marginBottom: 10 }}>Sections</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {atsResult.sectionsFound?.map((s) => (
                    <span key={s} className="badge badge-green">
                      <CheckCircle size={10} /> {s}
                    </span>
                  ))}
                  {atsResult.missingSections?.map((s) => (
                    <span key={s} className="badge badge-red">
                      <XCircle size={10} /> {s}
                    </span>
                  ))}
                </div>

                {atsResult.keywordsFound?.length > 0 && (
                  <>
                    <p className="mono" style={{ marginBottom: 10 }}>Keywords found</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                      {atsResult.keywordsFound.map((k) => (
                        <span key={k} className="badge badge-violet">{k}</span>
                      ))}
                    </div>
                  </>
                )}

                {atsResult.issues?.length > 0 && (
                  <>
                    <p className="mono" style={{ marginBottom: 10 }}>Issues</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {atsResult.issues.map((issue, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: 8,
                          fontSize: 13, color: "var(--muted)",
                        }}>
                          <AlertCircle size={13} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Panel>

              {/* Job match */}
              <Panel title="Job Description Match" icon={Target} iconColor="#10B981">
                <textarea
                  className="input"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here…"
                  rows={5}
                  style={{ marginBottom: 12 }}
                />
                <button
                  className="btn-primary"
                  onClick={matchJob}
                  disabled={loading || !jobDesc.trim()}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", fontSize: 13 }}
                >
                  {loading && !matchResult
                    ? <><Loader size={13} className="animate-spin" /> {loadMsg}</>
                    : <><Target size={13} /> Match resume</>}
                </button>

                {matchResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card-2" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: "#A78BFA" }}>
                        {matchResult.matchScore}%
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>Match score</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                          {matchResult.matchedKeywords?.length} of {matchResult.totalJDKeywords} keywords matched
                        </div>
                      </div>
                    </div>

                    {matchResult.matchedKeywords?.length > 0 && (
                      <>
                        <p className="mono">Matched</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {matchResult.matchedKeywords.map((k) => (
                            <span key={k} className="badge badge-green">✓ {k}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {matchResult.missingKeywords?.length > 0 && (
                      <>
                        <p className="mono" style={{ marginTop: 4 }}>Missing</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {matchResult.missingKeywords.map((k) => (
                            <span key={k.keyword} className={`badge ${
                              k.importance === "High" ? "badge-red"
                              : k.importance === "Medium" ? "badge-amber"
                              : "badge-gray"
                            }`}>
                              {k.keyword}
                              <span style={{ opacity: 0.6, fontSize: 10 }}>· {k.importance}</span>
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </Panel>

              {/* AI Feedback */}
              <Panel title="AI Feedback — Groq" icon={Sparkles} iconColor="#EC4899">
                {!aiLoaded && !loading && (
                  <button
                    className="btn-primary"
                    onClick={getAI}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", fontSize: 13 }}
                  >
                    <Sparkles size={13} /> Generate AI feedback
                  </button>
                )}
                {loading && !aiLoaded && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13 }}>
                    <Loader size={14} color="#A78BFA" className="animate-spin" /> {loadMsg}
                  </div>
                )}
                {aiFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {aiFeedback.summary && (
                      <div className="card-2" style={{ padding: "14px 16px" }}>
                        <p className="mono" style={{ marginBottom: 8 }}>Assessment</p>
                        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{aiFeedback.summary}</p>
                      </div>
                    )}
                    {aiFeedback.strengths?.length > 0 && (
                      <div>
                        <p className="mono" style={{ marginBottom: 10 }}>Strengths</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {aiFeedback.strengths.map((s, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                              <CheckCircle size={13} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} /> {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiFeedback.suggestions?.length > 0 && (
                      <div>
                        <p className="mono" style={{ marginBottom: 10 }}>Suggestions</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {aiFeedback.suggestions.map((s, i) => (
                            <div key={i} className="card-2"
                              style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <div style={{
                                width: 20, height: 20, borderRadius: 6,
                                background: "var(--accent)", flexShrink: 0, marginTop: 1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "Sora", fontWeight: 700, fontSize: 10, color: "#fff",
                              }}>{i + 1}</div>
                              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiFeedback.improvedBullets?.length > 0 && (
                      <div>
                        <p className="mono" style={{ marginBottom: 10 }}>Rewritten bullets</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {aiFeedback.improvedBullets.map((b, i) => (
                            <div key={i} className="card-2" style={{ padding: "14px 16px" }}>
                              <p style={{ fontSize: 12, color: "#EF4444", textDecoration: "line-through", marginBottom: 6 }}>
                                {b.original}
                              </p>
                              <p style={{ fontSize: 13, color: "#10B981", fontWeight: 500 }}>{b.improved}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Panel>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#EF444412", border: "1px solid #EF444428",
                  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#F87171",
                }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}