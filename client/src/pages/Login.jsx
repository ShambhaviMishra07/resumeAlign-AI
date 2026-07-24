import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab]     = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({ name: "", email: "", password: "" });

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
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080C18",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      <div className="orb orb-blue"   style={{ width: 500, height: 500, top: -150, left: -150 }} />
      <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: -150, right: -100 }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 36, cursor: "pointer", justifyContent: "center" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(91,110,245,0.4)",
          }}>
            <Zap size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 20, color: "#F0F4FF" }}>
            ResumeAI
          </span>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{
            display: "flex", background: "rgba(20,27,45,0.8)",
            border: "1px solid #1E2A45", borderRadius: 10,
            padding: 3, marginBottom: 28,
          }}>
            {["login", "register"].map((t) => (
              <button key={t}
                onClick={() => { setTab(t); setError(""); setForm({ name: "", email: "", password: "" }); }}
                style={{
                  flex: 1, padding: "8px",
                  background: tab === t
                    ? "linear-gradient(135deg, #5B6EF5, #7C5BF5)"
                    : "transparent",
                  border: "none", borderRadius: 8,
                  color: tab === t ? "#fff" : "#6B7A99",
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "Inter", cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                  boxShadow: tab === t ? "0 0 16px rgba(91,110,245,0.3)" : "none",
                }}
              >
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 22, color: "#F0F4FF", marginBottom: 6 }}>
                {tab === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p style={{ fontSize: 13, color: "#6B7A99", marginBottom: 24 }}>
                {tab === "login"
                  ? "Sign in to access your resume builder."
                  : "Free account. No credit card required."}
              </p>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 13, color: "#F87171", marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {tab === "register" && (
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 7 }}>Full Name</label>
                    <input className="input" name="name" value={form.name}
                      onChange={change} placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 7 }}>Email</label>
                  <input className="input" name="email" type="email" value={form.email}
                    onChange={change} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="label" style={{ display: "block", marginBottom: 7 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" name="password"
                      type={showPw ? "text" : "password"}
                      value={form.password} onChange={change}
                      placeholder="Min 6 characters"
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      style={{ paddingRight: 42 }}
                    />
                    <button onClick={() => setShowPw(!showPw)} style={{
                      position: "absolute", right: 13, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#3D4F6E",
                    }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button className="btn-primary" onClick={submit} disabled={loading}
                style={{ width: "100%", marginTop: 22, padding: "13px", fontSize: 15 }}>
                {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}