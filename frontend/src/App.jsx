import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, MessageSquare, User, Bot } from "lucide-react";

import axios from "axios";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
    const base_url = import.meta.env.VITE_API_URL;
    const [threadId] = useState(() => {
      const saved = sessionStorage.getItem("threadId");
      if (saved) return saved;

      const newId =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem("threadId", newId);
      return newId;
    });

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
      if (!input.trim()) return;

      const userInput = input;
      setMessages((prev) => [...prev, { role: "user", text: userInput }]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await axios.post(
          `${base_url}/api/enterprise-iq`,
          { input: userInput, threadId },
          { withCredentials: true }
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: response.data.message || response.data },
        ]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "❌ Server error. Try again." },
        ]);
      } finally {
        setIsTyping(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="backdrop-blur-xl bg-slate-900/80 border-b border-emerald-500/20 px-6 py-4 sticky top-0 z-10 shadow-lg shadow-emerald-500/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur opacity-60"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Enterprise IQ
              </span>
              <p className="text-xs text-emerald-400/60 font-medium">
                AI-Powered Assistant
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-300 font-medium">Online</span>
          </div>
        </div>
      </nav>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-5 rounded-3xl backdrop-blur-sm border border-emerald-500/30 shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-emerald-400 mx-auto" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                How can I help you today?
              </h2>
              <p className="text-slate-100 text-base max-w-xl leading-relaxed">
                I'm your company's internal AI assistant. Ask me about policies,
                procedures, guidelines, or any company-related questions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-2xl">
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                  <p className="text-sm text-slate-300 group-hover:text-emerald-300 transition-colors">
                    📋 Company Policies
                  </p>
                </div>
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                  <p className="text-sm text-slate-300 group-hover:text-emerald-300 transition-colors">
                    💼 HR Guidelines
                  </p>
                </div>
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                  <p className="text-sm text-slate-300 group-hover:text-emerald-300 transition-colors">
                    🔒 IT Support
                  </p>
                </div>
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                  <p className="text-sm text-slate-300 group-hover:text-emerald-300 transition-colors">
                    📚 Training Resources
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-700 to-blue-900 shadow-cyan-500/30"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              <div
                className={`px-6 py-4 rounded-2xl max-w-[75%] text-sm leading-relaxed backdrop-blur-sm shadow-xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-700 to-blue-900 shadow-cyan-500/20 border border-cyan-400/30"
                    : "bg-slate-800/90 shadow-emerald-500/10 border border-slate-700/50"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-6 py-4 rounded-2xl bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 shadow-xl shadow-emerald-500/10">
                <div className="flex gap-2">
                  <div
                    className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 pb-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-lg transition duration-500"></div>
            <div className="relative flex items-start gap-3 bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent outline-none resize-none text-sm placeholder-slate-400 max-h-32 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent"
                rows="1"
                placeholder="Ask me anything about company policies... (Shift+Enter for new line)"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 p-3 rounded-xl text-sm font-medium flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500/50 rounded-full"></span>
            Enterprise IQ can make mistakes. Consider checking important
            information.
          </p>
          <p className="text-xs text-slate-500 text-center mt-3 flex items-center justify-center gap-2">
            Made with ❤ by{" "}
            <a
              href="https://rm-portfolio-zeta.vercel.app/"
              className="text-blue-500"
            >
              Rohit Maurya
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
