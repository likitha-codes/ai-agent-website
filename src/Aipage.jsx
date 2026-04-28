import React, { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

// Get or create a persistent device ID
const getDeviceId = () => {
  let id = localStorage.getItem("iris_device_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("iris_device_id", id);
  }
  return id;
};

// Chat history helpers
const saveChatsToStorage = (chats) => {
  localStorage.setItem("iris_chats", JSON.stringify(chats));
};

const loadChatsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("iris_chats")) || [];
  } catch {
    return [];
  }
};

function Aipage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [chats, setChats] = useState(() => loadChatsFromStorage());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveChatToHistory = (sessionId, messages) => {
    if (messages.length === 0) return;
    const existing = loadChatsFromStorage();
    const title = messages[0]?.text?.slice(0, 40) || "New Chat";
    const updated = [
      { sessionId, title, messages, updatedAt: new Date().toISOString() },
      ...existing.filter(c => c.sessionId !== sessionId),
    ];
    saveChatsToStorage(updated);
    setChats(updated);
  };

  const loadChat = (sid) => {
    const all = loadChatsFromStorage();
    const chat = all.find(c => c.sessionId === sid);
    if (chat) {
      setMessages(chat.messages);
      setSessionId(sid);
      setGreeted(true);
      setSidebarOpen(false);
    }
  };

  const deleteChat = (e, sid) => {
    e.stopPropagation();
    const updated = loadChatsFromStorage().filter(c => c.sessionId !== sid);
    saveChatsToStorage(updated);
    setChats(updated);
    if (sid === sessionId) startNewChat();
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(uuidv4());
    setGreeted(false);
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!greeted) setGreeted(true);

    const userMessage = input;
    setInput("");
    setLoading(true);

    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);

    try {
      const res = await fetch("https://iris-ai-backend-onka.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
const fullReply = data.reply;

// Add empty AI message first
const aiMessage = { text: "", sender: "ai" };
setMessages([...newMessages, aiMessage]);

// Type out the response word by word
const words = fullReply.split(" ");
let current = "";
for (let i = 0; i < words.length; i++) {
  current += (i === 0 ? "" : " ") + words[i];
  const typed = current;
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1] = { text: typed, sender: "ai" };
    return updated;
  });
  await new Promise(r => setTimeout(r, 30));
}

const finalMessages = [...newMessages, { text: fullReply, sender: "ai" }];
saveChatToHistory(sessionId, finalMessages);
    } catch (error) {
      const finalMessages = [...newMessages, { text: "Oops! Something went wrong. Try again!", sender: "ai" }];
      setMessages(finalMessages);
      saveChatToHistory(sessionId, finalMessages);
    }

    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden">

      {/* CHAT HISTORY SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 border-r border-gray-700 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Chat History</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span> New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <p className="text-gray-500 text-xs text-center mt-8">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.sessionId}
                onClick={() => loadChat(chat.sessionId)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 hover:bg-slate-700 transition ${chat.sessionId === sessionId ? "bg-slate-700" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{chat.title || "New Chat"}</p>
                  <p className="text-xs text-gray-500">{formatDate(chat.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => deleteChat(e, chat.sessionId)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs ml-2 transition"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDE → AVATAR */}
<div className="w-1/4 border-r border-gray-700 flex items-center justify-center bg-slate-900">
        <Avatar isThinking={loading} />
      </div>

      {/* RIGHT SIDE → CHAT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition text-xl"
            title="Chat History"
          >
            ☰
          </button>
          <img src="/iris-logo.svg" alt="Iris logo" className="w-8 h-8 invert" />
          <span className="text-lg font-semibold flex-1">AI Companion</span>
          <button
            onClick={startNewChat}
            className="text-gray-400 hover:text-white transition text-sm border border-gray-600 px-3 py-1 rounded-lg"
          >
            + New
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">

          {/* GREETING OVERLAY */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-900 z-10 transition-all duration-500 ${greeted ? "opacity-0 -translate-y-6 pointer-events-none" : "opacity-100 translate-y-0"}`}>
            <img src="/iris-logo.svg" alt="Iris" className="w-24 h-24 invert" />
            <h2 className="text-2xl font-semibold tracking-widest">IRIS</h2>
            <p className="text-gray-400 text-sm tracking-wider">your ai companion</p>
            <p className="text-gray-500 text-xs mt-2">Ask me anything!</p>
          </div>

          {/* MESSAGES */}
          {messages.map((msg, index) => (
  <div
    key={index}
    className={`px-4 py-2 rounded-2xl shadow-md leading-relaxed ${
  msg.sender === "user"
    ? "max-w-[65%] ml-auto bg-blue-600 text-white text-base"
    : "max-w-[60%] mr-auto bg-gray-700 text-white text-base"
    }`}
  
  >
    {msg.sender === "user" ? (
      msg.text
    ) : (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-blue-300">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ inline, children }) =>
            inline ? (
              <code className="bg-gray-900 text-green-400 px-1 rounded text-xs">{children}</code>
            ) : (
              <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto mt-1 mb-2">
                <code>{children}</code>
              </pre>
            ),
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-1 text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
        }}
      >
        {msg.text}
      </ReactMarkdown>
    )}
  </div>
))}

          {loading && (
            <div className="bg-gray-700 max-w-xs px-4 py-2 rounded-lg animate-pulse">
              Thinking... 
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default Aipage;