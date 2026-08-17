import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, FileText, Zap, Target, Sparkles,
  Bot, CheckCircle, Lock, TrendingUp, Shield,
  Clock, Star, ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

const FEATURES = [
  {
    icon: Zap, color: "#5B6EF5",
    title: "ATS Scoring Engine",
    desc: "Rule-based scorer evaluates your resume across five weighted categories — sections, keywords, action verbs, length, and contact info. Returns a score out of 100 with a per-category breakdown so you know exactly what to fix.",
    tag: "No login needed",
  },
  {
    icon: Target, color: "#06B6D4",
    title: "Job Description Matching",
    desc: "Paste any job description and get a weighted keyword match score. Missing skills are ranked High / Medium / Low priority based on their importance to the role — not just a flat list.",
    tag: "No login needed",
  },
  {
    icon: Sparkles, color: "#10B981",
    title: "AI Resume Feedback",
    desc: "Groq LLaMA 3 reads your resume and returns a structured critique — overall assessment, three specific strengths, five improvement suggestions, and rewritten bullet points with stronger action verbs.",
    tag: "No login needed",
  },
  {
    icon: Bot, color: "#8B5CF6",
    title: "Agentic AI System",
    desc: "A tool-calling agent that autonomously decides which tools to run and in what order based on your goal. It remembers your past sessions and self-corrects its rewrites by re-scoring after every improvement attempt.",
    tag: "Sign in required",
    locked: true,
  },
  {
    icon: FileText, color: "#F59E0B",
    title: "Resume Builder",
    desc: "Build a structured resume from scratch with sections for projects, categorized skills, education, hackathons, and courses. Live preview updates as you type. One-click PDF export via Puppeteer.",
    tag: "Sign in required",
    locked: true,
  },
  {
    icon: TrendingUp, color: "#EC4899",
    title: "Self-Correction Loop",
    desc: "After every bullet rewrite, the agent re-runs the ATS scorer on the improved text. If the score didn't improve by 5+ points, it generates targeted feedback and tries again — showing you the score delta in real time.",
    tag: "Part of AI Agent",
    locked: true,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your resume",
    desc: "Drop a PDF or DOCX file — no account needed. Our parser extracts every word with section-level precision.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Get your ATS score",
    desc: "See your score out of 100 with an animated breakdown across five categories. Understand exactly what's hurting you.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Match to a job description",
    desc: "Paste any JD. Get a weighted match percentage and a ranked list of missing keywords with priority labels.",
    icon: Target,
  },
  {
    step: "04",
    title: "Let the agent optimize",
    desc: "Tell the agent your goal. It plans, executes tools, self-corrects, and streams progress — all autonomously.",
    icon: Bot,
  },
];

const AGENT_STEPS = [
  { label: "analyze_ats",            desc: "Scores resume → 68/100",           color: "#5B6EF5" },
  { label: "match_job_description",  desc: "JD match → 61% · 4 gaps found",    color: "#06B6D4" },
  { label: "rewrite_resume_bullets", desc: "Rewrote 3 bullets",                 color: "#10B981" },
  { label: "Self-correction check",  desc: "Re-scored → 84/100 · +16 pts ✓",   color: "#8B5CF6" },
];

const STATS = [
  { val: "100",  unit: "pt",  label: "Max ATS score" },
  { val: "4",    unit: "×",   label: "Autonomous tools" },
  { val: "7",    unit: "d",   label: "Memory retention" },
  { val: "< 60", unit: "s",   label: "Full analysis time" },
];

const WHAT_YOU_GET = [
  "ATS score with category breakdown",
  "Keyword gap analysis ranked by priority",
  "AI rewritten bullet points",
  "Job description match percentage",
  "Missing skills with importance labels",
  "Cross-session agent memory",
  "Self-correcting improvement loop",
  "Live resume preview",
  "PDF export",
];

export default function Landing() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  const handleProtected = (path) => {
    navigate(token ? path : "/login?redirect=protected");
  };

  return (
    <div style={{ background: "#080C18", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Navbar />

      {/* Global orbs */}
      <div className="orb orb-blue"   style={{ width: 700, height: 700, top: -250, left: -250, opacity: 0.25 }} />
      <div className="orb orb-purple" style={{ width: 600, height: 600, top: 200, right: -200, opacity: 0.2  }} />

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "160px 24px 120px",
        position: "relative", zIndex: 1,
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="badge badge-blue"
            style={{ marginBottom: 28, fontSize: 12, display: "inline-flex" }}
          >
            <Bot size={11} /> Agentic AI · Tool Calling · Self-Correction · Memory
          </motion.div>

          <h1 style={{
            fontFamily: "Sora", fontWeight: 800,
            fontSize: "clamp(40px, 6.5vw, 80px)",
            lineHeight: 1.05, letterSpacing: "-0.035em",
            color: "#F0F4FF", marginBottom: 28,
          }}>
            Stop getting filtered<br />
            <span className="gradient-text">before they read you.</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "#6B7A99", lineHeight: 1.8,
            maxWidth: 580, margin: "0 auto 48px",
          }}>
            Upload your resume and get an ATS score, weighted job-match analysis,
            and AI-rewritten bullet points. Or let the autonomous agent do all
            of it in one conversation — and remember where it left off next time.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(91,110,245,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: "15px 32px", fontSize: 16, display: "flex", alignItems: "center", gap: 9 }}
              onClick={() => navigate("/analyzer")}
            >
              Analyze my resume — free <ArrowRight size={17} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost"
              style={{ padding: "15px 32px", fontSize: 16, display: "flex", alignItems: "center", gap: 9 }}
              onClick={() => handleProtected("/agent")}
            >
              <Bot size={17} />
              {token ? "Open AI Agent" : "Try AI Agent — sign in"}
              {!token && <Lock size={13} style={{ opacity: 0.5 }} />}
            </motion.button>
          </div>

          <p style={{ fontSize: 12, color: "#3D4F6E", marginTop: 20 }}>
            No credit card · Analyze without account · PDF export included
          </p>
        </motion.div>

        {/* Hero stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: "flex", gap: 0, marginTop: 80,
            borderTop: "1px solid #1E2A45",
            borderBottom: "1px solid #1E2A45",
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "32px 24px", textAlign: "center",
              borderRight: i < STATS.length - 1 ? "1px solid #1E2A45" : "none",
            }}>
              <div style={{
                fontFamily: "Sora", fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 44px)",
                letterSpacing: "-0.03em", color: "#F0F4FF",
              }}>
                {s.val}<span style={{ color: "#5B6EF5", fontSize: "0.6em" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7A99", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Hero mock UI */}
        <motion.div
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="glass"
          style={{
            maxWidth: 860, margin: "64px auto 0",
            padding: "28px",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 100px rgba(91,110,245,0.07)",
          }}
        >
          {/* Browser bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10B981" }} />
            <div className="glass-sm" style={{
              flex: 1, marginLeft: 12, padding: "5px 14px",
              fontSize: 11, color: "#3D4F6E", textAlign: "left",
            }}>
              resumealign.app/agent
            </div>
          </div>

          {/* Agent steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {AGENT_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                className="glass-sm"
                style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: step.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${step.color}`,
                }} />
                <code style={{ fontSize: 12, color: step.color, fontFamily: "monospace", flexShrink: 0 }}>
                  {step.label}
                </code>
                <span style={{ fontSize: 12, color: "#6B7A99", marginLeft: "auto" }}>{step.desc}</span>
                <CheckCircle size={13} color="#10B981" />
              </motion.div>
            ))}
          </div>

          {/* Score row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { val: "68",  label: "Before",    color: "#EF4444" },
              { val: "→",   label: "",           color: "#6B7A99" },
              { val: "84",  label: "After",      color: "#10B981" },
              { val: "+16", label: "Improvement", color: "#5B6EF5" },
            ].map((s, i) => (
              <div key={i} className="glass-sm" style={{ padding: "14px", textAlign: "center" }}>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 28, color: s.color }}>
                  {s.val}
                </div>
                {s.label && <div style={{ fontSize: 10, color: "#3D4F6E", marginTop: 3 }}>{s.label}</div>}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "100px 24px",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <p className="label" style={{ marginBottom: 14 }}>Workflow</p>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 46px)",
            letterSpacing: "-0.03em", color: "#F0F4FF",
          }}>
            From upload to optimized<br />in under 60 seconds.
          </h2>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 2,
          border: "1px solid #1E2A45",
          borderRadius: 16, overflow: "hidden",
        }}>
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "#0F1628",
                padding: "36px 28px",
                borderRight: i < HOW_IT_WORKS.length - 1 ? "1px solid #1E2A45" : "none",
                position: "relative",
              }}
            >
              <div style={{
                fontFamily: "Sora", fontWeight: 800,
                fontSize: 56, color: "rgba(91,110,245,0.12)",
                letterSpacing: "-0.03em", lineHeight: 1,
                marginBottom: 20,
              }}>
                {step.step}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(91,110,245,0.1)",
                border: "1px solid rgba(91,110,245,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <step.icon size={17} color="#818CF8" />
              </div>
              <h3 style={{
                fontFamily: "Sora", fontWeight: 600,
                fontSize: 17, color: "#F0F4FF", marginBottom: 10,
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6B7A99", lineHeight: 1.7 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "20px 24px 100px",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <p className="label" style={{ marginBottom: 14 }}>Capabilities</p>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 46px)",
            letterSpacing: "-0.03em", color: "#F0F4FF", marginBottom: 16,
          }}>
            Everything in one place.
          </h2>
          <p style={{ fontSize: 16, color: "#6B7A99", maxWidth: 500, margin: "0 auto" }}>
            Three tools are free with no account. Sign in to unlock the AI agent, memory, and resume builder.
          </p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden"
          whileInView="show" viewport={{ once: true }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 16 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i} variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="gradient-border"
              style={{ padding: "30px 26px", cursor: "default" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: f.color + "15",
                  border: `1px solid ${f.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <f.icon size={19} color={f.color} />
                </div>
                <span className={`badge ${f.locked ? "badge-amber" : "badge-green"}`}
                  style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  {f.locked ? <Lock size={9} /> : <CheckCircle size={9} />}
                  {f.tag}
                </span>
              </div>
              <h3 style={{
                fontFamily: "Sora", fontWeight: 600,
                fontSize: 17, color: "#F0F4FF", marginBottom: 10,
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6B7A99", lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── AGENT EXPLAINER ── */}
      <section style={{
        borderTop: "1px solid #1E2A45",
        borderBottom: "1px solid #1E2A45",
        position: "relative", zIndex: 1,
        overflow: "hidden",
      }}>
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: "50%", left: "30%", transform: "translateY(-50%)", opacity: 0.12 }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="label" style={{ marginBottom: 14 }}>AI Agent</p>
            <h2 style={{
              fontFamily: "Sora", fontWeight: 700,
              fontSize: "clamp(26px, 3.5vw, 40px)",
              letterSpacing: "-0.025em", color: "#F0F4FF", marginBottom: 20,
            }}>
              It plans. It executes.<br />It corrects itself.
            </h2>
            <p style={{ fontSize: 15, color: "#6B7A99", lineHeight: 1.8, marginBottom: 32 }}>
              The agent uses Groq LLaMA 3 with tool calling. When you say "optimize my resume for a Google SWE role", it decides on its own to analyze first, then match keywords, then rewrite — and verifies each rewrite actually improved your score before moving on.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Reads your intent — no rigid prompts",
                "Calls tools in the order that makes sense",
                "Remembers your past sessions",
                "Re-scores after every rewrite to verify improvement",
                "Retries with better feedback if score didn't improve",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={15} color="#5B6EF5" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#A0B0C8" }}>{item}</span>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ marginTop: 36, padding: "13px 26px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
              onClick={() => handleProtected("/agent")}
            >
              <Bot size={16} />
              {token ? "Open AI Agent" : "Sign in to use Agent"}
              <ChevronRight size={14} />
            </motion.button>
          </motion.div>

          {/* Agent flow diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {[
              { label: "User",                 text: "Optimize my resume for a backend role", type: "user" },
              { label: "analyze_ats",           text: "Score: 62/100 · Missing: experience section keywords", type: "tool", color: "#5B6EF5" },
              { label: "match_job_description", text: "Match: 58% · High priority gaps: Docker, PostgreSQL", type: "tool", color: "#06B6D4" },
              { label: "rewrite_resume_bullets", text: "Rewrote 3 bullets with action verbs + impact metrics", type: "tool", color: "#10B981" },
              { label: "Self-correction",        text: "Re-scored: 81/100 (+19 pts) ✓ Improvement verified", type: "correction", color: "#8B5CF6" },
              { label: "Agent",                  text: "Here's your optimized resume with 81 ATS score…", type: "agent" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-sm"
                style={{ padding: "12px 16px" }}
              >
                <div style={{ fontSize: 10, color: item.color || (item.type === "user" ? "#818CF8" : item.type === "agent" ? "#10B981" : "#6B7A99"), fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  {item.type === "tool" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />}
                  {item.label}
                </div>
                <p style={{ fontSize: 12, color: "#8892A4" }}>{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "100px 24px",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p className="label" style={{ marginBottom: 14 }}>Included</p>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 42px)",
            letterSpacing: "-0.025em", color: "#F0F4FF",
          }}>
            Everything you need.<br />Nothing you don't.
          </h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden"
          whileInView="show" viewport={{ once: true }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}
        >
          {WHAT_YOU_GET.map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              className="glass-sm"
              style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <CheckCircle size={15} color="#5B6EF5" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#A0B0C8" }}>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        borderTop: "1px solid #1E2A45",
        padding: "100px 24px",
        textAlign: "center",
        position: "relative", zIndex: 1,
        overflow: "hidden",
      }}>
        <div className="orb orb-blue" style={{ width: 600, height: 600, bottom: -300, left: "50%", transform: "translateX(-50%)", opacity: 0.15 }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge badge-blue" style={{ marginBottom: 24, display: "inline-flex" }}>
            <Star size={11} /> Free to start · No credit card
          </div>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 800,
            fontSize: "clamp(30px, 5vw, 56px)",
            letterSpacing: "-0.03em", color: "#F0F4FF",
            marginBottom: 20, lineHeight: 1.1,
          }}>
            Ready to get past<br />
            <span className="gradient-text">the ATS filter?</span>
          </h2>
          <p style={{ fontSize: 17, color: "#6B7A99", marginBottom: 44, maxWidth: 480, margin: "0 auto 44px" }}>
            Upload your resume in seconds. No account needed to analyze. Sign in only when you're ready to build or use the agent.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(91,110,245,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: "16px 36px", fontSize: 17, display: "flex", alignItems: "center", gap: 10 }}
              onClick={() => navigate("/analyzer")}
            >
              Analyze my resume <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost"
              style={{ padding: "16px 36px", fontSize: 17, display: "flex", alignItems: "center", gap: 10 }}
              onClick={() => navigate("/login")}
            >
              Create free account
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1E2A45",
        padding: "32px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={12} color="#fff" />
          </div>
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 14, color: "#F0F4FF" }}>
            ResumeAlign AI
          </span>
        </div>
        <span style={{ fontSize: 13, color: "#3D4F6E" }}>
          React · Node.js · Express · MongoDB · Groq LLaMA 3
        </span>
        <span style={{ fontSize: 13, color: "#3D4F6E" }}>
          Built by Shambhavi Mishra
        </span>
      </footer>
    </div>
  );
}