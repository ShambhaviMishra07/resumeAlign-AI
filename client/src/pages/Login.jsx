import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const url = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const { data } = await axios.post(url, body);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      navigate("/analyzer");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setIsLogin(tab === "login");
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 justify-center mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <span className="font-sora font-bold text-2xl text-[#1E1B2E]">
            ResumeAI
          </span>
        </div>

        <div className="glass rounded-3xl p-8 shadow-xl">
          {/* Tab toggle */}
          <div className="flex glass-dark rounded-2xl p-1 mb-8">
            {[
              { label: "Login", val: "login" },
              { label: "Register", val: "register" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => switchTab(tab.val)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  (tab.val === "login") === isLogin
                    ? "bg-white shadow text-[#1E1B2E]"
                    : "text-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-sora font-bold text-2xl text-[#1E1B2E] mb-1">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {isLogin
                  ? "Sign in to access your resume analyzer"
                  : "Start analyzing your resume for free"}
              </p>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full glass-dark rounded-xl px-4 py-3 text-sm text-[#1E1B2E] placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 transition"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full glass-dark rounded-xl px-4 py-3 text-sm text-[#1E1B2E] placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="w-full glass-dark rounded-xl px-4 py-3 text-sm text-[#1E1B2E] placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 transition pr-11"
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-semibold shadow-lg shadow-purple-200 disabled:opacity-60 transition"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}