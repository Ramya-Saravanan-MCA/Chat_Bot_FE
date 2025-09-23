import React, { useState, useRef, useEffect } from "react";

const API_BASE = "/api";

const ChatUI = ({ sessionId, messages, setMessages }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const typeBotMessage = (text) => {
    let words = text.split(" ");
    let currentText = "";
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? "" : " ") + words[index];
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isTyping) {
            return [...prev.slice(0, -1), { ...lastMessage, text: currentText }];
          }
          return prev;
        });
        index++;
      } else {
        setMessages((prev) => prev.map((m) => ({ ...m, isTyping: false })));
        clearInterval(typingInterval);
      }
    }, 150);
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = {
      role: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    const typingMessage = {
      role: "bot",
      text: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query: userMessage.text }),
      });
      const data = await res.json();
      const botText = data.answer || "Could you ask something else I can help you with?";
      typeBotMessage(botText);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev
          .filter((m) => !m.isTyping)
          .concat({
            role: "bot",
            text: "Failed to reach backend.",
            timestamp: new Date(),
          })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="w-full max-w-3xl h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-600 text-white p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-wide">Hybrid RAG Chatbot</h2>
          <div className="flex space-x-3 mt-2">
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              Session ID: <span className="font-mono">{sessionId}</span>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              Turn:{" "}
              <span className="font-bold">
                {messages.filter((m) => m.role === "bot" && !m.isTyping).length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold shadow">
                    B
                  </div>
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gray-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                } ${m.isTyping ? "opacity-60 italic" : ""}`}
              >
                {m.text || (m.isTyping && "…")}
              </div>
              {m.role === "user" && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold shadow">
                    U
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 bg-gray-100 border-t flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-gray-600 text-white font-medium hover:bg-gray-700 disabled:bg-gray-400 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
