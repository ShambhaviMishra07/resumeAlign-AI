import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Zap, Target, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";

const TICKER_ITEMS = [
  "ATS Score  68 → 91",  "·",
  "Keywords matched  11/14", "·",
  "Missing skill: Docker", "·",
  "Action verbs added  +6", "·",
  "Job match  74%", "·",
  "Bullet rewritten  ×3", "·",
  "Score improved  +23 pts", "·",
  "ATS Score  68 → 91",  "·",
  "Keywords matched  11/14", "·",
  "Missing skill: Docker", "·",
  "Action verbs added  +6", "·",
  "Job match  74%", "·",
  "Bullet rewritten  ×3", "·",
  "Score improved  +23 pts", "·",
];

const FEATURES = [
  {
    icon: FileText,
    label: "Parse",
    title: "Reads every word",
    desc: "Extracts text from PDF and DOCX with section-level precision — education, experience, skills, projects.",
  },
  {
    icon: Zap,
    label: "Score",
    title: "ATS score in seconds",
    desc: "Rule-based engine checks keyword density, section presence, action verbs, contact info. Score out of 100.",
  },
  {
    icon: Target,
    label: "Match",
    title: "Job description fit",
    desc: "Paste any JD. Weighted keyword matching ranks missing skills by High / Medium / Low priority.",
  },
  {
    icon: Sparkles,
    label: "Improve",
    title: "AI rewrites your bullets",
    desc: "Groq AI identifies weak lines and rewrites them with stronger verbs, specific impact, and ATS phrasing.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "140px 24px 80px" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 700 }}
        >
          <div className="badge badge-violet" style={{ marginBottom: 20 }}>
            <Zap size={11} /> AI-Powered · ATS-Ready
          </div>

          <h1 style={{
            fontFamily: "Sora",
            fontWeight: 800,
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            marginBottom: 24,
          }}>
            Your resume,<br />
            <span className="sweep-underline" style={{ color: "#A78BFA" }}>
              actually optimized.
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: "var(--muted)", lineHeight: 1.7,
            maxWidth: 520, marginBottom: 36,
          }}>
            Upload your resume. Get an ATS score, job-match analysis,
            and AI-rewritten bullet points — in under 60 seconds.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: "12px 24px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}
              onClick={() => navigate("/analyzer")}
            >
              Analyze my resume <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-ghost"
              style={{ padding: "12px 24px", fontSize: 15 }}
              onClick={() => navigate("/builder")}
            >
              Build from scratch
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            display: "flex", gap: 40, marginTop: 60,
            paddingTop: 40, borderTop: "1px solid var(--border)",
          }}
        >
          {[
            { val: "100",  unit: "pt",   label: "ATS score ceiling" },
            { val: "60",   unit: "sec",  label: "Average analysis time" },
            { val: "3×",   unit: "",     label: "More callbacks reported" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: "var(--text)", letterSpacing: "-0.03em" }}>
                {s.val}<span style={{ fontSize: 18, color: "var(--accent)" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Ticker ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="ticker-wrap"
      >
        <span className="ticker-inner">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{
              marginRight: 40,
              color: item === "·" ? "var(--border-2)" : "var(--muted)",
            }}>
              {item}
            </span>
          ))}
        </span>
      </motion.div>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 56 }}
        >
          <span className="mono">What it does</span>
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.025em",
            color: "var(--text)", marginTop: 12,
          }}>
            Four tools. One workflow.
          </h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 2,
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i} variants={fadeUp}
              style={{
                background: "var(--surface)",
                padding: "32px 28px",
                borderRight: i < FEATURES.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <f.icon size={17} color="#A78BFA" />
              </div>
              <span className="mono" style={{ color: "#7C3AED" }}>{f.label}</span>
              <h3 style={{
                fontFamily: "Sora", fontWeight: 600, fontSize: 17,
                color: "var(--text)", margin: "8px 0 10px",
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        borderTop: "1px solid var(--border)",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontFamily: "Sora", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 40px)",
            letterSpacing: "-0.025em",
            color: "var(--text)", marginBottom: 16,
          }}>
            Ready to get past the filter?
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 32 }}>
            No account needed to analyze. Just upload and go.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ padding: "13px 28px", fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => navigate("/analyzer")}
          >
            Get my ATS score <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px",
        textAlign: "center",
        fontSize: 13,
        color: "var(--muted)",
        fontFamily: "JetBrains Mono",
      }}>
        ResumeAI · Node.js · Express · MongoDB · Groq AI
      </footer>
    </div>
  );
}