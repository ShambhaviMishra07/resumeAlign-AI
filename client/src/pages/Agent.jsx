import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Upload, FileText, Send, Zap, Target,
  Sparkles, Brain, AlertCircle, Loader, CheckCircle, X,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

// Tool metadata for display
const TOOL_META = {
  analyze_ats: {
    label: "Analyzing ATS score",
    icon: Zap,
    color: "#5B6EF5",
  },
  match_job_description: {
    label: "Matching job description",
    icon: Target,
    color: "#06B6D4",
  },
  rewrite_resume_bullets: {
    label: "Rewriting bullet points",
    icon: Sparkles,
    color: "#10B981",
  },
  suggest_missing_skills: {
    label: "Suggesting missing skills",
    icon: Brain,
    color: "#F59E0B",
  },
};

const SUGGESTIONS = [
  "Analyze my resume and tell me what to improve",
  "Optimize my resume for a Google SWE role",
  "What skills am I missing for a backend developer position?",
  "Rewrite my experience bullets to be stronger",
];

export default function Agent() {
  const [file, setFile]           = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc]     = useState("");
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError]         = useState("");
  const chatEndRef                = useRef(null);
  const abortRef                  = useRef(null);
  const [cachedATS, setCachedATS] = useState(null);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onDrop = useCallback(async (accepted) => {
    if (!accepted[0]) return;
    setFile(accepted[0]);
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", accepted[0]);
      const { data } = await axios.post("/agent/upload-context", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(data.resumeText);
    } catch (err) {
      setError("Failed to parse resume. Try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: uploading || !!resumeText,
  });

  const sendMessage = async (messageText) => {
    const msg = messageText || input.trim();
    if (!msg || isRunning) return;

    setInput("");
    setIsRunning(true);
    setError("");

    // Add user message
    const userMsg = { role: "user", content: msg, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    // Add placeholder agent message
    const agentMsgId = Date.now() + 1;
    const agentMsg = {
      role: "agent",
      id: agentMsgId,
      toolCalls: [],
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, agentMsg]);

    try {
      const response = await fetch("/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          resumeText,
          jobDescription: jobDesc,
        }),
      });

      if (!response.ok) throw new Error("Agent request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const eventText = line.replace("data: ", "");
          let event;
          try { event = JSON.parse(eventText); } catch { continue; }

          if (event.type === "tool_start") {
            setMessages((prev) => prev.map((m) => m.id === agentMsgId
              ? { ...m, toolCalls: [...m.toolCalls, { tool: event.tool, status: "running" }] }
              : m
            ));
          }

          if (event.type === "tool_result") {
            setMessages((prev) => prev.map((m) => m.id === agentMsgId
              ? {
                  ...m,
                  toolCalls: m.toolCalls.map((tc) =>
                    tc.tool === event.tool && tc.status === "running"
                      ? { ...tc, status: "done", result: event.result }
                      : tc
                  ),
                }
              : m
            ));
          }

          if (event.type === "final") {
            setMessages((prev) => prev.map((m) => m.id === agentMsgId
              ? { ...m, content: event.content, isStreaming: false }
              : m
            ));
          }

          if (event.type === "done") {
            setMessages((prev) => prev.map((m) => m.id === agentMsgId
              ? { ...m, isStreaming: false }
              : m
            ));
          }

          if (event.type === "error") {
            setError(event.content);
            setMessages((prev) => prev.map((m) => m.id === agentMsgId
              ? { ...m, content: "Something went wrong. Please try again.", isStreaming: false }
              : m
            ));
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.map((m) => m.id === agentMsgId
        ? { ...m, content: "Request failed. Please try again.", isStreaming: false }
        : m
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const clearResume = () => {
    setFile(null);
    setResumeText("");
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div style={{ background: "#080C18", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Navbar />

      <div className="orb orb-purple" style={{ width: 400, height: 400, top: 0, right: 0, opacity: 0.2 }} />
      <div className="orb orb-blue"   style={{ width: 350, height: 350, bottom: 0, left: 0, opacity: 0.15 }} />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "90px 24px 24px",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 20,
        height: "100vh",
        position: "relative", zIndex: 1,
      }}>

        {/* ── Left sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "auto", paddingBottom: 24 }}>

          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(91,110,245,0.4)",
              }}>
                <Bot size={15} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 15, color: "#F0F4FF" }}>
                  AI Agent
                </div>
                <div style={{ fontSize: 11, color: "#5B6EF5" }}>Tool-calling · Groq LLaMA 3</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#6B7A99", lineHeight: 1.6, marginTop: 8 }}>
              Upload your resume and optionally a job description. Then tell the agent what you want — it decides which tools to run.
            </p>
          </div>

          {/* Resume upload */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Resume</p>
            {!resumeText ? (
              <div
                {...getRootProps()}
                className="glass"
                style={{
                  padding: "20px 16px", textAlign: "center", cursor: "pointer",
                  borderStyle: "dashed",
                  borderColor: isDragActive ? "#5B6EF5" : "rgba(91,110,245,0.15)",
                  background: isDragActive ? "rgba(91,110,245,0.06)" : "rgba(15,22,40,0.65)",
                  transition: "all 0.2s",
                }}
              >
                <input {...getInputProps()} />
                <Upload size={18} color="#5B6EF5" style={{ margin: "0 auto 8px" }} />
                {uploading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 12, color: "#6B7A99" }}>
                    <Loader size={12} className="animate-spin" /> Parsing…
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: "#F0F4FF", fontWeight: 500, marginBottom: 3 }}>
                      Drop resume here
                    </p>
                    <p style={{ fontSize: 11, color: "#3D4F6E" }}>PDF or DOCX</p>
                  </>
                )}
              </div>
            ) : (
              <div className="glass-sm" style={{
                padding: "12px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={14} color="#5B6EF5" />
                  <div>
                    <p style={{ fontSize: 12, color: "#F0F4FF", fontWeight: 500 }}>{file?.name}</p>
                    <p style={{ fontSize: 11, color: "#3D4F6E" }}>
                      {resumeText.split(" ").length} words parsed
                    </p>
                  </div>
                </div>
                <button onClick={clearResume} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#3D4F6E",
                  padding: 2,
                }}>
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Job Description <span style={{ color: "#3D4F6E", textTransform: "none", fontSize: 10 }}>(optional)</span></p>
            <textarea
              className="input"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste job description for matching…"
              rows={5}
              style={{ fontSize: 12 }}
            />
          </div>

          {/* Suggestions */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Try asking</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  onClick={() => sendMessage(s)}
                  disabled={isRunning}
                  style={{
                    background: "rgba(91,110,245,0.06)",
                    border: "1px solid rgba(91,110,245,0.12)",
                    borderRadius: 8, padding: "8px 12px",
                    fontSize: 12, color: "#6B7A99",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "Inter",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91,110,245,0.1)";
                    e.currentTarget.style.color = "#F0F4FF";
                    e.currentTarget.style.borderColor = "rgba(91,110,245,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(91,110,245,0.06)";
                    e.currentTarget.style.color = "#6B7A99";
                    e.currentTarget.style.borderColor = "rgba(91,110,245,0.12)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {messages.length > 0 && (
            <button className="btn-ghost" onClick={clearChat}
              style={{ fontSize: 12, padding: "8px", marginTop: "auto" }}>
              Clear conversation
            </button>
          )}
        </div>

        {/* ── Chat area ── */}
        <div className="glass" style={{
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 114px)",
          overflow: "hidden",
        }}>
          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 32px rgba(91,110,245,0.3)",
                }}>
                  <Bot size={26} color="#fff" />
                </div>
                <h3 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 18, color: "#F0F4FF", marginBottom: 8 }}>
                  Resume AI Agent
                </h3>
                <p style={{ fontSize: 13, color: "#6B7A99", maxWidth: 360, margin: "0 auto" }}>
                  Upload your resume on the left, then ask me anything. I'll autonomously choose which tools to run to help you.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* User message */}
                      {msg.role === "user" && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <div className="chat-bubble-user">{msg.content}</div>
                        </div>
                      )}

                      {/* Agent message */}
                      {msg.role === "agent" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {/* Tool calls */}
                          {msg.toolCalls?.length > 0 && (
                            <div style={{
                              display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6,
                            }}>
                              {msg.toolCalls.map((tc, i) => {
                                const meta = TOOL_META[tc.tool] || { label: tc.tool, color: "#6B7A99" };
                                const Icon = meta.icon || Zap;
                                return (
                                  <div key={i} className="tool-pill" style={{
                                    borderColor: `${meta.color}30`,
                                    color: meta.color,
                                    background: `${meta.color}10`,
                                  }}>
                                    {tc.status === "running"
                                      ? <Loader size={10} className="animate-spin" />
                                      : <CheckCircle size={10} />}
                                    <Icon size={10} />
                                    {meta.label}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Agent response */}
                          <div className="chat-bubble-agent">
                            {msg.isStreaming && !msg.content ? (
                              <div style={{ display: "flex", gap: 5, padding: "4px 0" }}>
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                              </div>
                            ) : (
                              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                                {msg.content}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              margin: "0 20px 10px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, padding: "9px 14px",
              fontSize: 12, color: "#F87171",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid #1E2A45",
            display: "flex", gap: 10, alignItems: "flex-end",
          }}>
            <textarea
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask the agent anything about your resume… (Enter to send)"
              rows={1}
              style={{
                flex: 1, resize: "none", fontSize: 14,
                maxHeight: 120, overflowY: "auto",
              }}
            />
            <button
              className="btn-primary"
              onClick={() => sendMessage()}
              disabled={isRunning || !input.trim()}
              style={{
                padding: "10px 14px", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {isRunning
                ? <Loader size={15} className="animate-spin" />
                : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}