import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, LogOut } from "lucide-react";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem("token");
  const userName  = localStorage.getItem("userName");

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "rgba(9,9,15,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
            ResumeAI
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {location.pathname !== "/analyzer" && (
            <button className="btn-ghost" style={{ padding: "7px 16px", fontSize: 13 }}
              onClick={() => navigate("/analyzer")}>
              Analyze Resume
            </button>
          )}
          {location.pathname !== "/builder" && (
            <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}
              onClick={() => navigate("/builder")}>
              Build Resume
            </button>
          )}
          {token ? (
            <>
              <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>
                {userName}
              </span>
              <button className="btn-ghost" style={{ padding: "7px 12px" }} onClick={logout}>
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <button className="btn-ghost" style={{ padding: "7px 16px", fontSize: 13 }}
              onClick={() => navigate("/login")}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}