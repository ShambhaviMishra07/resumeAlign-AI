import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Zap, Target, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: FileText,
    title: "Smart Parsing",
    desc: "Supports PDF and DOCX. Extracts every section with precision.",
    color: "#A78BFA",
    bg: "#A78BFA20",
  },
  {
    icon: Zap,
    title: "ATS Scoring",
    desc: "Rule-based engine checks formatting, keywords, and structure instantly.",
    color: "#F9A8D4",
    bg: "#F9A8D420",
  },
  {
    icon: Target,
    title: "Job Matching",
    desc: "Paste any job description and see exactly what skills are missing.",
    color: "#6EE7B7",
    bg: "#6EE7B720",
  },
  {
    icon: Sparkles,
    title: "AI Feedback",
    desc: "ChatGPT rewrites weak points and suggests stronger action verbs.",
    color: "#FCD34D",
    bg: "#FCD34D20",
  },
];

const steps = [
  { num: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX file" },
  { num: "02", title: "Get ATS Score", desc: "See your score and what's hurting it" },
  { num: "03", title: "Match to Job", desc: "Paste a JD and find skill gaps" },
  { num: "04", title: "AI Feedback", desc: "Get ChatGPT-powered improvements" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen z-10">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block glass px-4 py-1.5 rounded-full text-sm font-medium text-purple-700 mb-6">
            ✦ AI-Powered Resume Analysis
          </span>

          <h1 className="font-sora font-extrabold text-5xl md:text-6xl leading-tight text-[#1E1B2E] mb-6">
            Your resume deserves
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-400 to-purple-400">
              to get noticed.
            </span>
          </h1>

          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your resume, get an ATS score, match it to any job
            description, and receive AI-powered feedback — all in seconds.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-200 inline-flex items-center gap-2"
          >
            Analyze My Resume <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Mock preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-16 glass rounded-3xl p-6 max-w-2xl mx-auto shadow-xl"
        >
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-300" />
            <div className="w-3 h-3 rounded-full bg-yellow-300" />
            <div className="w-3 h-3 rounded-full bg-green-300" />
            <span className="ml-3 text-xs text-gray-400">resumeai.app/analyzer</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="glass-dark rounded-2xl p-4 text-center">
              <div className="text-3xl font-sora font-bold text-purple-600">87</div>
              <div className="text-xs text-gray-500 mt-1">ATS Score</div>
            </div>
            <div className="glass-dark rounded-2xl p-4 text-center">
              <div className="text-3xl font-sora font-bold text-pink-500">12</div>
              <div className="text-xs text-gray-500 mt-1">Keywords Found</div>
            </div>
            <div className="glass-dark rounded-2xl p-4 text-center">
              <div className="text-3xl font-sora font-bold text-emerald-500">78%</div>
              <div className="text-xs text-gray-500 mt-1">Job Match</div>
            </div>
          </div>

          {/* AI suggestion preview */}
          <div className="glass-dark rounded-2xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={13} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-600 mb-1">
                  AI Suggestion
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Replace{" "}
                  <span className="line-through text-red-400">
                    "responsible for managing"
                  </span>{" "}
                  with{" "}
                  <span className="text-emerald-600 font-medium">
                    "spearheaded"
                  </span>{" "}
                  to strengthen impact and pass ATS filters.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-sora text-3xl font-bold text-[#1E1B2E] mb-3">
            Everything you need to land the job
          </h2>
          <p className="text-gray-500">
            Four powerful tools in one clean interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: f.bg }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-sora font-semibold text-[#1E1B2E] text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-sora text-3xl font-bold text-[#1E1B2E] mb-3">
            How it works
          </h2>
          <p className="text-gray-500">
            From upload to optimized resume in under a minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-3xl p-6 text-center"
            >
              <div className="font-sora text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400 mb-3">
                {s.num}
              </div>
              <h3 className="font-semibold text-[#1E1B2E] mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/30 py-8 text-center text-gray-400 text-sm">
        Built with Node.js · Express · MongoDB · OpenAI
      </footer>
    </div>
  );
}