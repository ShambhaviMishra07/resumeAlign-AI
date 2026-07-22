import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Sparkles, Target, CheckCircle,
  XCircle, AlertCircle, ChevronDown, ChevronUp, Loader,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Zap } from "lucide-react";

const token = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

// --- Score Ring Component ---
function ScoreRing({ score }) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? "#6EE7B7" : score >= 50 ? "#FCD34D" : "#F9A8D4";
  const label =
    score >= 75 ? "Great" : score >= 50 ? "Average" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
        <text
          x={size / 2} y={size / 2 - 6}
          textAnchor="middle" fontSize="28"
          fontWeight="700" fill="#1E1B2E"
          fontFamily="Sora, sans-serif"
        >
          {score}
        </text>
        <text
          x={size / 2} y={size / 2 + 18}
          textAnchor="middle" fontSize="11"
          fill="#9CA3AF" fontFamily="Inter, sans-serif"
        >
          ATS Score
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{
          background: color + "30",
          color:
            color === "#6EE7B7"
              ? "#059669"
              : color === "#FCD34D"
              ? "#B45309"
              : "#DB2777",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// --- Collapsible Section ---
function Section({ title, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} style={{ color: iconColor }} />
          <h3 className="font-sora font-semibold text-[#1E1B2E]">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Analyzer Page ---
export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  // Results state
  const [resumeText, setResumeText] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatched, setJobMatched] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setError(""); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  // Step 1 — Analyze ATS
  const analyze = async () => {
    if (!file) return setError("Please upload a resume first");
    setLoading(true);
    setError("");
    setLoadingMsg("Parsing your resume...");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      setLoadingMsg("Calculating ATS score...");
      const { data } = await axios.post("/analyze/ats", formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });
      setResumeText(data.resumeText);
      setAtsResult(data.atsResult);
      setStep("results");
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Match JD
  const matchJob = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true);
    setLoadingMsg("Matching against job description...");
    try {
      const { data } = await axios.post(
        "/analyze/match",
        { resumeText, jobDescription: jobDesc },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      setMatchResult(data);
      setJobMatched(true);
    } catch (err) {
      setError("Job matching failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — AI Feedback
  const getAiFeedback = async () => {
    if (aiLoaded) return;
    setLoading(true);
    setLoadingMsg("ChatGPT is analyzing your resume...");
    try {
      const { data } = await axios.post(
        "/analyze/ai-feedback",
        { resumeText, atsResult },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      setAiFeedback(data.feedback);
      setAiLoaded(true);
    } catch (err) {
      setError("AI feedback failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null); setStep("upload"); setResumeText("");
    setAtsResult(null); setMatchResult(null); setAiFeedback(null);
    setJobDesc(""); setJobMatched(false); setAiLoaded(false); setError("");
  };

  return (
    <div className="relative min-h-screen z-10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <AnimatePresence mode="wait">

          {/* ---- UPLOAD STEP ---- */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-10">
                <h1 className="font-sora font-bold text-4xl text-[#1E1B2E] mb-3">
                  Analyze Your Resume
                </h1>
                <p className="text-gray-500">
                  Upload your resume to get your ATS score, AI feedback, and
                  job match — all in one place.
                </p>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`glass rounded-3xl p-16 text-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragActive
                    ? "border-purple-400 bg-purple-50/20"
                    : "border-white/50 hover:border-purple-300"
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Upload size={28} className="text-purple-500" />
                  </div>
                  {file ? (
                    <div className="flex items-center gap-3 glass-dark px-5 py-3 rounded-2xl">
                      <FileText size={20} className="text-purple-500" />
                      <span className="font-medium text-[#1E1B2E]">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-[#1E1B2E]">
                        {isDragActive
                          ? "Drop it here!"
                          : "Drag & drop your resume"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        or click to browse · PDF and DOCX supported · Max 5MB
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-500 text-sm glass rounded-xl px-4 py-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyze}
                disabled={loading || !file}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><Loader size={20} className="animate-spin" /> {loadingMsg}</>
                ) : (
                  <><Sparkles size={20} /> Analyze Resume</>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ---- RESULTS STEP ---- */}
          {step === "results" && atsResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="font-sora font-bold text-3xl text-[#1E1B2E]">
                    Your Results
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">{file?.name}</p>
                </div>
                <button
                  onClick={reset}
                  className="glass-dark px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-[#1E1B2E] transition"
                >
                  ↑ Upload New
                </button>
              </div>

              {/* Score overview */}
              <div className="glass rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center">
                  <ScoreRing score={atsResult.score} />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Sections Found", value: atsResult.sectionsFound?.length, color: "#A78BFA" },
                    { label: "Missing Sections", value: atsResult.missingSections?.length, color: "#F9A8D4" },
                    { label: "Keywords Found", value: atsResult.keywordsFound?.length, color: "#6EE7B7" },
                    { label: "Action Verbs", value: atsResult.actionVerbsFound?.length, color: "#FCD34D" },
                  ].map((stat, i) => (
                    <div key={i} className="glass-dark rounded-2xl p-4">
                      <div
                        className="text-2xl font-sora font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value ?? 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Breakdown */}
              <Section
                title="ATS Breakdown"
                icon={Zap}
                iconColor="#A78BFA"
                defaultOpen={true}
              >
                {/* Score bars */}
                <div className="space-y-3 mb-5">
                  {Object.entries(atsResult.breakdown || {}).map(([key, val]) => {
                    const max = { sections: 30, keywords: 25, actionVerbs: 20, length: 15, contactInfo: 10 };
                    const pct = Math.round((val / (max[key] || 1)) * 100);
                    const labels = {
                      sections: "Sections", keywords: "Keywords",
                      actionVerbs: "Action Verbs", length: "Length",
                      contactInfo: "Contact Info",
                    };
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{labels[key]}</span>
                          <span>{val}/{max[key]}</span>
                        </div>
                        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sections */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Sections
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {atsResult.sectionsFound?.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle size={11} /> {s}
                    </span>
                  ))}
                  {atsResult.missingSections?.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-400 border border-red-100">
                      <XCircle size={11} /> {s} (missing)
                    </span>
                  ))}
                </div>

                {/* Keywords */}
                {atsResult.keywordsFound?.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Keywords Found
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {atsResult.keywordsFound.map((k) => (
                        <span key={k} className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Issues */}
                {atsResult.issues?.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Issues to Fix
                    </p>
                    <ul className="space-y-2">
                      {atsResult.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Section>

              {/* Job Match */}
              <Section title="Job Description Match" icon={Target} iconColor="#6EE7B7">
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={5}
                  className="w-full glass-dark rounded-2xl px-4 py-3 text-sm text-[#1E1B2E] placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 resize-none mb-4"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={matchJob}
                  disabled={loading || !jobDesc.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && !jobMatched ? (
                    <><Loader size={14} className="animate-spin" /> {loadingMsg}</>
                  ) : (
                    <><Target size={14} /> Match Resume</>
                  )}
                </motion.button>

                {matchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 space-y-4"
                  >
                    {/* Match score */}
                    <div className="glass-dark rounded-2xl p-4 flex items-center gap-4">
                      <div className="text-4xl font-sora font-bold text-purple-600">
                        {matchResult.matchScore}%
                      </div>
                      <div>
                        <div className="font-semibold text-[#1E1B2E]">Match Score</div>
                        <div className="text-xs text-gray-400">
                          {matchResult.matchedKeywords?.length} of{" "}
                          {matchResult.totalJDKeywords} keywords matched
                        </div>
                      </div>
                    </div>

                    {/* Matched */}
                    {matchResult.matchedKeywords?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Matched Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.matchedKeywords.map((k) => (
                            <span key={k} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                              ✓ {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing */}
                    {matchResult.missingKeywords?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Missing Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.missingKeywords.map((k) => (
                            <span
                              key={k.keyword}
                              className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 ${
                                k.importance === "High"
                                  ? "bg-red-50 text-red-500 border-red-100"
                                  : k.importance === "Medium"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-gray-50 text-gray-500 border-gray-100"
                              }`}
                            >
                              {k.keyword}
                              <span className="opacity-60 text-[10px]">
                                · {k.importance}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Section>

              {/* AI Feedback */}
              <Section
                title="AI Feedback by ChatGPT"
                icon={Sparkles}
                iconColor="#F9A8D4"
              >
                {!aiLoaded && !loading && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getAiFeedback}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-xl font-semibold text-sm flex items-center gap-2"
                  >
                    <Sparkles size={14} /> Generate AI Feedback
                  </motion.button>
                )}

                {loading && !aiLoaded && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Loader size={16} className="animate-spin text-purple-500" />
                    {loadingMsg}
                  </div>
                )}

                {aiFeedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Summary */}
                    {aiFeedback.summary && (
                      <div className="glass-dark rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Overall Assessment
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiFeedback.summary}
                        </p>
                      </div>
                    )}

                    {/* Strengths */}
                    {aiFeedback.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Strengths
                        </p>
                        <ul className="space-y-2">
                          {aiFeedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {aiFeedback.suggestions?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Suggestions
                        </p>
                        <div className="space-y-2">
                          {aiFeedback.suggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 glass-dark rounded-xl p-3">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-[10px] font-bold">{i + 1}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improved bullets */}
                    {aiFeedback.improvedBullets?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Improved Bullet Points
                        </p>
                        <div className="space-y-3">
                          {aiFeedback.improvedBullets.map((b, i) => (
                            <div key={i} className="glass-dark rounded-xl p-4 space-y-2">
                              <p className="text-xs text-red-400 line-through">{b.original}</p>
                              <p className="text-xs text-emerald-600 font-medium">{b.improved}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Section>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm glass rounded-xl px-4 py-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}