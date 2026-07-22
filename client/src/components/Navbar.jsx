import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, LogOut } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-5xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-sora font-bold text-[#1E1B2E]">ResumeAI</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <span className="text-sm text-gray-500 hidden md:block">
                Hi, {userName} 👋
              </span>
              {location.pathname !== "/analyzer" && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/analyzer")}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-xl text-sm font-semibold"
                >
                  Go to Analyzer
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={logout}
                className="p-2 glass-dark rounded-xl text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="px-4 py-2 glass-dark rounded-xl text-sm font-semibold text-[#1E1B2E]"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-xl text-sm font-semibold"
              >
                Get Started
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}