import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Zap, Target, Sparkles, Bot, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const FEATURES = [
  { icon: FileText, title: "Smart Parsing",   desc: "Extracts text from PDF and DOCX with section-level precision.", color: "#5B6EF5" },
  { icon: Zap,      title: "ATS Scoring",     desc: "Rule-based engine scores keyword density, verbs, sections, contact info.", color: "#8B5CF6" },
  { icon: Target,   title: "Job Matching",    desc: "Weighted keyword matching with High / Medium / Low priority gaps.", color: "#06B6D4" },
  { icon: Sparkles, title: "AI Feedback",     desc: "Groq AI rewrites weak bullets and suggests stronger phrasing.", color: "#10B981" },
  { icon: Bot,      title: "AI Agent",        desc: "Tool-calling agent autonomously plans and executes resume optimization.", color: "#F59E0B" },
  { icon: FileText, title: "Resume Builder",  desc: "Build a structured resume from scratch with live preview and PDF export.", color: "#EC4899" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#080C18", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Navbar />

      {/* Background orbs */}
      <div className="orb orb-blue"   style={{ width: 600, height: 600, top: -200, left: -200 }} />
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: 100, right: -150 }} />
      <div className="orb orb-cyan"   style={{ width: 400, height: 400, top: 400, left: "40%" }} />

      {/* ── Hero ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "160px 24px 100px",
        position: "relative", zIndex: 1, textAlign: "center",
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

          <div className="badge badge-blue" style={{ marginBottom: 24, fontSize: 12 }}>
            <Bot size={11} /> Tool-Calling AI Agent · ATS Optimization · PDF Export
          </div>

          <h1 style={{
            fontFamily: "Sora", fontWeight: 800,
            fontSize: "clamp(38px, 6vw, 72px)",
            lineHeight: 1.08, letterSpacing: "-0.03em",
            color: "#F0F4FF", marginBottom: 24,
          }}>
            Your resume, <span className="gradient-text">actually optimized.</span>
          </h1>

          <p style={{
            fontSize: 18, color: "#6B7A99", lineHeight: 1.75,
            maxWidth: 560, margin: "0 auto 40px",
          }}>
            Upload your resume and get an ATS score, weighted job-match analysis,
            AI-rewritten bullet points, and an autonomous agent that does it all in one shot.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: "13px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}
              onClick={() => navigate("/analyzer")}
            >
              Analyze my resume <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-ghost"
              style={{ padding: "13px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}
              onClick={() => navigate("/agent")}
            >
              <Bot size={16} /> Try the AI Agent
            </motion.button>
          </div>
        </motion.div>

        {/* Hero glass card — mock UI */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="glass"
          style={{
            maxWidth: 780, margin: "64px auto 0",
            padding: "28px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 80px rgba(91,110,245,0.08)",
          }}
        >
          {/* Fake browser bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
            <div className="glass-sm" style={{
              flex: 1, marginLeft: 10, padding: "4px 12px",
              fontSize: 11, color: "#3D4F6E",
            }}>
              
              resumeai.app/analyzer
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { val: "91", label: "ATS Score", color: "#10B981" },
              { val: "14", label: "Keywords",  color: "#5B6EF5" },
              { val: "87%", label: "Job Match", color: "#8B5CF6" },
            ].map((s, i) => (
              <div key={i} className="glass-sm" style={{ padding: "16px", textAlign: "center" }}>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: s.color }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: "#3D4F6E", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Agent message preview */}
          <div className="glass-sm" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={13} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#5B6EF5", fontWeight: 600, marginBottom: 4 }}>
                  AI Agent · 4 tools used
                </p>
                <p style={{ fontSize: 13, color: "#8892A4", lineHeight: 1.6 }}>
                  Analyzed resume · Matched Google SWE JD · Identified 3 missing keywords ·
                  Rewrote 2 weak bullets. Score improved <span style={{ color: "#10B981", fontWeight: 600 }}>68 → 91</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "80px 24px",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p className="label" style={{ marginBottom: 12 }}>Capabilities</p>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 40px)",
            letterSpacing: "-0.025em", color: "#F0F4FF",
          }}>
            Six tools. One platform.
          </h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeUp} className="gradient-border"
              style={{ padding: "28px 24px" }}
              whileHover={{ translateY: -4, transition: { duration: 0.2 } }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: f.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, border: `1px solid ${f.color}25`,
              }}>
                <f.icon size={18} color={f.color} />
              </div>
              <h3 style={{
                fontFamily: "Sora", fontWeight: 600, fontSize: 16,
                color: "#F0F4FF", marginBottom: 8,
              }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6B7A99", lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "80px 24px 120px",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p className="label" style={{ marginBottom: 12 }}>Workflow</p>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 40px)",
            letterSpacing: "-0.025em", color: "#F0F4FF",
          }}>
            Upload. Analyze. Optimize.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { step: "01", title: "Upload resume",   desc: "PDF or DOCX. No login needed to analyze." },
            { step: "02", title: "Get ATS score",   desc: "Score out of 100 with detailed breakdown." },
            { step: "03", title: "Match to JD",     desc: "Paste job description, see keyword gaps." },
            { step: "04", title: "AI optimizes",    desc: "Agent rewrites bullets, suggests skills." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{ padding: "28px 22px" }}
            >
              <div style={{
                fontFamily: "Sora", fontWeight: 800, fontSize: 40,
                color: "rgba(91,110,245,0.2)", letterSpacing: "-0.03em",
                marginBottom: 14,
              }}>
                {s.step}
              </div>
              <h3 style={{ fontFamily: "Sora", fontWeight: 600, fontSize: 16, color: "#F0F4FF", marginBottom: 8 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6B7A99", lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        borderTop: "1px solid #1E2A45",
        padding: "80px 24px",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div className="orb orb-blue" style={{ width: 400, height: 400, bottom: -200, left: "50%", transform: "translateX(-50%)" }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 42px)",
            letterSpacing: "-0.025em", color: "#F0F4FF", marginBottom: 16,
          }}>
            Ready to get past the ATS filter?
          </h2>
          <p style={{ color: "#6B7A99", fontSize: 16, marginBottom: 36 }}>
            No account needed to analyze. Upload and get results in seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: "13px 28px", fontSize: 15 }}
              onClick={() => navigate("/analyzer")}
            >
              Get my ATS score
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-ghost"
              style={{ padding: "13px 28px", fontSize: 15 }}
              onClick={() => navigate("/builder")}
            >
              Build resume from scratch
            </motion.button>
          </div>
        </motion.div>
      </section>

      <footer style={{
        borderTop: "1px solid #1E2A45", padding: "28px 24px",
        textAlign: "center", fontSize: 13, color: "#3D4F6E",
        position: "relative", zIndex: 1,
      }}>
        resumeAlign AI · Built with Node.js · Express · MongoDB · Groq AI
      </footer>
    </div>
  );
}