import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Login() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });

  const change = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const url  = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await axios.post(url, body);
      localStorage.setItem("token",    data.token);
      localStorage.setItem("userId",   data.user.id);
      localStorage.setItem("userName", data.user.name);
      const redirect = params.get("redirect");
      navigate(redirect === "builder" ? "/builder" : "/analyzer");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, cursor: "pointer" }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            ResumeAI
          </span>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tab toggle */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            marginBottom: 28,
            position: "relative",
          }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); setForm({ name: "", email: "", password: "" }); }}
                style={{
                  flex: 1, padding: "0 0 14px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 600,
                  fontFamily: "Inter",
                  color: tab === t ? "var(--text)" : "var(--muted)",
                  transition: "color 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
            <motion.div
              className="tab-indicator"
              animate={{ left: tab === "login" ? 0 : "50%", width: "50%" }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <h2 style={{
                fontFamily: "Sora", fontWeight: 700, fontSize: 22,
                color: "var(--text)", marginBottom: 6,
              }}>
                {tab === "login" ? "Sign in" : "Create account"}
              </h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
                {tab === "login"
                  ? "Access your resume builder and saved analyses."
                  : "Free account. No credit card."}
              </p>

              {error && (
                <div style={{
                  background: "#EF444415", border: "1px solid #EF444430",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 13, color: "#F87171", marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {tab === "register" && (
                  <div>
                    <label className="mono" style={{ display: "block", marginBottom: 6 }}>Full Name</label>
                    <input className="input" name="name" value={form.name}
                      onChange={change} placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="mono" style={{ display: "block", marginBottom: 6 }}>Email</label>
                  <input className="input" name="email" type="email" value={form.email}
                    onChange={change} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="mono" style={{ display: "block", marginBottom: 6 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" name="password"
                      type={showPw ? "text" : "password"}
                      value={form.password} onChange={change}
                      placeholder="Min 6 characters"
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      style={{ paddingRight: 40 }}
                    />
                    <button onClick={() => setShowPw(!showPw)} style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--muted)",
                    }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={submit}
                disabled={loading}
                style={{ width: "100%", marginTop: 24, padding: "12px", fontSize: 15 }}
              >
                {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}