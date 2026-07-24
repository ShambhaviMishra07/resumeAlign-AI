import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, LogOut, Bot } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const logout = () => { localStorage.clear(); navigate("/"); };

  const navLinks = [
    { label: "Analyze",      path: "/analyzer" },
    { label: "AI Agent",     path: "/agent"    },
    { label: "Build Resume", path: "/builder"  },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, width: "calc(100% - 48px)", maxWidth: 1100,
      }}
    >
      <div className="glass" style={{
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(91,110,245,0.4)",
          }}>
            <Zap size={15} color="#fff" />
          </div>
          <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 15, color: "#F0F4FF" }}>
            resumeAlign AI
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map((link) => (
            <button key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                background: location.pathname === link.path
                  ? "rgba(91,110,245,0.12)" : "transparent",
                border: location.pathname === link.path
                  ? "1px solid rgba(91,110,245,0.25)" : "1px solid transparent",
                color: location.pathname === link.path ? "#818CF8" : "#6B7A99",
                borderRadius: 8, padding: "6px 14px",
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "Inter",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path) e.target.style.color = "#F0F4FF";
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path) e.target.style.color = "#6B7A99";
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {token ? (
            <>
              <span style={{ fontSize: 13, color: "#6B7A99" }}>{userName}</span>
              <button className="btn-ghost"
                onClick={logout}
                style={{ padding: "7px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <LogOut size={13} /> Sign out
              </button>
            </>
          ) : (
            <button className="btn-primary"
              onClick={() => navigate("/login")}
              style={{ padding: "7px 18px", fontSize: 13 }}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}