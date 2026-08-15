import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Upload, FileText, Send, Zap, Target,
  Sparkles, Brain, AlertCircle, Loader,
  CheckCircle, X, TrendingUp, TrendingDown,
  RotateCcw, Plus, History,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

// ── Tool display metadata ──
const TOOL_META = {
  analyze_ats:            { label: "Analyzing ATS score",       icon: Zap,      color: "#5B6EF5" },
  match_job_description:  { label: "Matching job description",  icon: Target,   color: "#06B6D4" },
  rewrite_resume_bullets: { label: "Rewriting bullet points",   icon: Sparkles, color: "#10B981" },
  suggest_missing_skills: { label: "Suggesting missing skills", icon: Brain,    color: "#F59E0B" },
};

const SUGGESTIONS = [
  "Analyze my resume and tell me what to improve",
  "Optimize my resume for a Google SWE role",
  "What skills am I missing for a backend developer position?",
  "Rewrite my experience bullets to be stronger",
];

// ── Generate a session ID ──
const makeSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ── Score change badge ──
function ScoreChange({ before, after }) {
  const diff  = after - before;
  const color = diff > 0 ? "#10B981" : diff < 0 ? "#EF4444" : "#6B7A99";
  const Icon  = diff > 0 ? TrendingUp : TrendingDown;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "4px 10px", fontSize: 11,
      color, fontWeight: 600, marginTop: 6,
    }}>
      <Icon size={11} />
      ATS {before} → {after} ({diff > 0 ? "+" : ""}{diff} pts)
    </div>
  );
}

export default function Agent() {
  const [file, setFile]             = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc]       = useState("");
  const [uploading, setUploading]   = useState(false);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [isRunning, setIsRunning]   = useState(false);
  const [error, setError]           = useState("");
  const [cachedATS, setCachedATS]   = useState(null);
  const [sessionId, setSessionId]   = useState(() => makeSessionId());
  const [loadingMemory, setLoadingMemory] = useState(false);
  const chatEndRef = useRef(null);
  const userId = localStorage.getItem("userId") || "anonymous";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load memory for current session on mount
  useEffect(() => {
    loadSessionMemory(sessionId);
  }, [sessionId]);

  const loadSessionMemory = async (sid) => {
    setLoadingMemory(true);
    try {
      const { data } = await axios.get(`/agent/memory/${sid}`);
      if (data.turns?.length > 0) {
        // Reconstruct messages from memory
        const restored = data.turns.map((turn, i) => ({
          id:      `mem_${i}`,
          role:    turn.role === "user" ? "user" : "agent",
          content: turn.content,
          toolCalls: (turn.toolsUsed || []).map((t) => ({ tool: t, status: "done" })),
          fromMemory: true,
        }));
        setMessages(restored);

        if (data.lastAtsScore) {
          setCachedATS({ score: data.lastAtsScore });
        }
      }
    } catch {
      // No memory yet — fresh start
    } finally {
      setLoadingMemory(false);
    }
  };

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
    } catch {
      setError("Failed to parse resume.");
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

    // Add user message to UI
    const userMsgId = Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: msg }]);

    // Placeholder agent message
    const agentMsgId = Date.now() + 1;
    setMessages((prev) => [...prev, {
      id: agentMsgId, role: "agent",
      toolCalls: [], content: "", isStreaming: true,
      scoreChanges: [],
    }]);

    try {
      const response = await fetch("/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:         msg,
          resumeText,
          jobDescription:  jobDesc,
          cachedATS,
          sessionId,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Agent request failed");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text  = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          let event;
          try { event = JSON.parse(line.replace("data: ", "")); }
          catch { continue; }

          // Tool started
          if (event.type === "tool_start") {
            setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
              ...m,
              toolCalls: [
                ...m.toolCalls,
                {
                  tool:         event.tool,
                  status:       "running",
                  retryAttempt: event.retryAttempt || 0,
                },
              ],
            }));
          }

          // Tool finished
          if (event.type === "tool_result") {
            // Cache ATS result
            if (event.tool === "analyze_ats") {
              try {
                const parsed = JSON.parse(event.result);
                if (parsed.score) setCachedATS(parsed);
              } catch {}
            }

            setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
              ...m,
              toolCalls: m.toolCalls.map((tc) =>
                tc.tool === event.tool && tc.status === "running"
                  ? { ...tc, status: "done" }
                  : tc
              ),
            }));
          }

          // Self-correction event
          if (event.type === "self_correction") {
            setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
              ...m,
              scoreChanges: [
                ...(m.scoreChanges || []),
                {
                  before:  event.scoreBefore,
                  after:   event.scoreAfter,
                  improved: event.improved,
                  isRetry:  event.isRetry || false,
                },
              ],
              // Mark last tool as done with correction status
              toolCalls: m.toolCalls.map((tc, i) =>
                i === m.toolCalls.length - 1
                  ? { ...tc, status: "done", corrected: !event.improved }
                  : tc
              ),
            }));
          }

          // Final response
          if (event.type === "final") {
            setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
              ...m,
              content:     event.content,
              isStreaming: false,
            }));
          }

          if (event.type === "done") {
            setMessages((prev) => prev.map((m) => m.id !== agentMsgId
              ? m
              : { ...m, isStreaming: false }
            ));
          }

          if (event.type === "error") {
            setError(event.content);
            setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
              ...m,
              content:     "Something went wrong. Please try again.",
              isStreaming: false,
            }));
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.map((m) => m.id !== agentMsgId ? m : {
        ...m,
        content:     "Request failed. Please try again.",
        isStreaming: false,
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const clearResume = () => { setFile(null); setResumeText(""); setCachedATS(null); };

  const newSession = () => {
    setMessages([]);
    setSessionId(makeSessionId());
    setCachedATS(null);
    setError("");
  };

  const clearSession = async () => {
    try {
      await axios.delete(`/agent/memory/${sessionId}`);
    } catch {}
    newSession();
  };

  return (
    <div style={{ background: "#080C18", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Navbar />

      <div className="orb orb-purple" style={{ width: 400, height: 400, top: 0,    right: 0,   opacity: 0.15 }} />
      <div className="orb orb-blue"   style={{ width: 350, height: 350, bottom: 0, left: 0,    opacity: 0.12 }} />

      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "90px 24px 24px",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 20,
        height: "100vh",
        position: "relative", zIndex: 1,
      }}>

        {/* ── Sidebar ── */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          overflowY: "auto", paddingBottom: 24,
        }}>

          {/* Agent header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(91,110,245,0.4)",
              }}>
                <Bot size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 15, color: "#F0F4FF" }}>
                  AI Agent
                </div>
                <div style={{ fontSize: 11, color: "#5B6EF5" }}>
                  Memory · Self-Correction · Groq LLaMA 3
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#6B7A99", lineHeight: 1.6 }}>
              Upload your resume, then ask anything. The agent remembers your conversation and auto-corrects its rewrites.
            </p>
          </div>

          {/* ATS score badge if cached */}
          {cachedATS && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-sm"
              style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: cachedATS.score >= 75 ? "#10B98120" : cachedATS.score >= 50 ? "#F59E0B20" : "#EF444420",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${cachedATS.score >= 75 ? "#10B98130" : cachedATS.score >= 50 ? "#F59E0B30" : "#EF444430"}`,
              }}>
                <span style={{
                  fontFamily: "Sora", fontWeight: 800, fontSize: 14,
                  color: cachedATS.score >= 75 ? "#10B981" : cachedATS.score >= 50 ? "#F59E0B" : "#EF4444",
                }}>
                  {cachedATS.score}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#F0F4FF" }}>Current ATS Score</div>
                <div style={{ fontSize: 11, color: "#6B7A99" }}>Cached · won't re-analyze</div>
              </div>
            </motion.div>
          )}

          {/* Memory indicator */}
          {messages.some((m) => m.fromMemory) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(91,110,245,0.08)",
              border: "1px solid rgba(91,110,245,0.2)",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 11, color: "#818CF8",
            }}>
              <History size={12} />
              Memory restored from previous session
            </div>
          )}

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
                    <Loader size={12} className="animate-spin" /> Parsing resume…
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: "#F0F4FF", fontWeight: 500, marginBottom: 3 }}>
                      {isDragActive ? "Drop it here" : "Drag & drop resume"}
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
                    <p style={{ fontSize: 12, color: "#F0F4FF", fontWeight: 500 }}>
                      {file?.name || "Resume loaded"}
                    </p>
                    <p style={{ fontSize: 11, color: "#3D4F6E" }}>
                      {resumeText.split(" ").length} words parsed
                    </p>
                  </div>
                </div>
                <button onClick={clearResume} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#3D4F6E",
                }}>
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Job description */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>
              Job Description{" "}
              <span style={{ color: "#3D4F6E", textTransform: "none", fontSize: 10 }}>
                (optional)
              </span>
            </p>
            <textarea
              className="input"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste job description for matching…"
              rows={4}
              style={{ fontSize: 12 }}
            />
          </div>

          {/* Suggestions */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Try asking</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} disabled={isRunning}
                  style={{
                    background: "rgba(91,110,245,0.06)",
                    border: "1px solid rgba(91,110,245,0.12)",
                    borderRadius: 8, padding: "8px 12px",
                    fontSize: 12, color: "#6B7A99",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s", fontFamily: "Inter",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(91,110,245,0.1)";
                    e.currentTarget.style.color = "#F0F4FF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(91,110,245,0.06)";
                    e.currentTarget.style.color = "#6B7A99";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Session controls */}
          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <button className="btn-ghost" onClick={newSession}
              style={{ flex: 1, fontSize: 12, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={12} /> New session
            </button>
            {messages.length > 0 && (
              <button className="btn-ghost" onClick={clearSession}
                style={{ flex: 1, fontSize: 12, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#EF4444", borderColor: "rgba(239,68,68,0.2)" }}>
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="glass" style={{
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 114px)",
          overflow: "hidden",
        }}>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
            {loadingMemory ? (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <Loader size={20} color="#5B6EF5" className="animate-spin" style={{ margin: "0 auto" }} />
                <p style={{ fontSize: 13, color: "#6B7A99", marginTop: 12 }}>Restoring memory…</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16, margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #5B6EF5, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 32px rgba(91,110,245,0.3)",
                }}>
                  <Bot size={28} color="#fff" />
                </div>
                <h3 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 18, color: "#F0F4FF", marginBottom: 8 }}>
                  Resume AI Agent
                </h3>
                <p style={{ fontSize: 13, color: "#6B7A99", maxWidth: 380, margin: "0 auto", lineHeight: 1.65 }}>
                  Upload your resume on the left, then tell me your goal. I'll autonomously choose which tools to run — and remember our conversation across sessions.
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

                          {/* Tool pills */}
                          {msg.toolCalls?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                              {msg.toolCalls.map((tc, i) => {
                                const meta = TOOL_META[tc.tool] || { label: tc.tool, color: "#6B7A99" };
                                const Icon = meta.icon || Zap;
                                return (
                                  <div key={i} className="tool-pill" style={{
                                    borderColor: `${meta.color}30`,
                                    color:       meta.color,
                                    background:  `${meta.color}10`,
                                  }}>
                                    {tc.status === "running"
                                      ? <Loader size={9} className="animate-spin" />
                                      : tc.corrected
                                      ? <RotateCcw size={9} />
                                      : <CheckCircle size={9} />}
                                    <Icon size={9} />
                                    {meta.label}
                                    {tc.retryAttempt > 0 && (
                                      <span style={{ opacity: 0.6, fontSize: 9 }}>
                                        · retry {tc.retryAttempt}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Score changes from self-correction */}
                          {msg.scoreChanges?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {msg.scoreChanges.map((sc, i) => (
                                <ScoreChange key={i} before={sc.before} after={sc.after} />
                              ))}
                            </div>
                          )}

                          {/* Memory indicator */}
                          {msg.fromMemory && (
                            <div style={{
                              fontSize: 10, color: "#3D4F6E",
                              display: "flex", alignItems: "center", gap: 4,
                            }}>
                              <History size={9} /> From memory
                            </div>
                          )}

                          {/* Agent response bubble */}
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
              margin: "0 16px 10px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
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
              placeholder={
                resumeText
                  ? "Ask the agent anything… (Enter to send, Shift+Enter for new line)"
                  : "Upload a resume first, then ask anything…"
              }
              rows={1}
              style={{
                flex: 1, resize: "none", fontSize: 14,
                maxHeight: 100, overflowY: "auto",
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