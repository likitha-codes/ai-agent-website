import React, { useState } from "react";
import "./index.css";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Aipage from "./Aipage";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "FAQ", path: "/faq" },
    { name: "Help", path: "/help" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="px-6 py-4 border-b border-gray-800">
      <div className="flex justify-between items-center">
        {/* LOGO */}
        <div
          onClick={() => { navigate("/"); setMenuOpen(false); }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/iris-logo.svg" alt="Iris logo" className="w-7 h-7 invert" />
          <h1 className="text-base font-bold">Iris - AI Companion</h1>
        </div>

        {/* DESKTOP LINKS */}
        <ul className="hidden md:flex gap-6 text-gray-300">
          {links.map((link) => (
            <li
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`hover:text-white cursor-pointer transition text-sm ${
                location.pathname === link.path ? "text-white font-semibold" : ""
              }`}
            >
              {link.name}
            </li>
          ))}
        </ul>

        {/* HAMBURGER */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <ul className="md:hidden flex flex-col gap-3 mt-4 pb-2 border-t border-gray-800 pt-4">
          {links.map((link) => (
            <li
              key={link.name}
              onClick={() => { navigate(link.path); setMenuOpen(false); }}
              className={`cursor-pointer text-sm px-2 ${
                location.pathname === link.path
                  ? "text-white font-semibold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />

      {/* HERO */}
      <div className="text-center mt-8 px-6 flex flex-col items-center">
        <img
          src="/iris-logo.svg"
          alt="Iris"
          className="w-16 h-16 md:w-20 md:h-20 invert mb-4 opacity-90"
        />
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Iris Your AI Companion
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-6 max-w-md">
          Study smarter. Understand deeper. Explore faster.
        </p>
        <button
          onClick={() => navigate("/ai")}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 text-sm md:text-base"
        >
          Launch Iris
        </button>
      </div>

      {/* FEATURES */}
      <section className="px-6 md:px-16 mt-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
          What Your Iris Can Do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { title: "Summarize Notes", desc: "Turn long study material into short, clear summaries instantly." },
            { title: "Explain Concepts", desc: "Break down difficult topics into simple explanations." },
            { title: "Break Down Topics", desc: "Understand concepts step by step." },
            { title: "Generate Questions", desc: "Create quizzes and practice questions." },
            { title: "Study Plans", desc: "Get personalized plans." },
            { title: "Flashcards", desc: "Convert notes into flashcards." },
            { title: "Documentation", desc: "Organize your study material." },
            { title: "Academic Help", desc: "Get answers instantly." },
            { title: "Companion Mode", desc: "Chat, jokes, advice, stories." },
          ].map((f) => (
            <div key={f.title} className="p-4 bg-slate-800 rounded-xl">
              <h3 className="font-semibold text-base mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <div className="text-center mt-16 mb-12 px-6">
        <p className="text-lg md:text-2xl italic text-gray-300 max-w-xl mx-auto leading-relaxed">
          "Somewhere between a question and an answer… is understanding.
          <br />
          Helping you learn, think, and grow."
        </p>
        <p className="mt-6 text-sm text-gray-500 tracking-wide">~ Likitha</p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          About Iris
        </h1>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
          Iris is a smart, friendly study assistant built to help students learn faster, understand deeper, and stay motivated throughout their academic journey.
        </p>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
          It can summarize notes, explain complex concepts, generate practice questions, create study plans, and even crack a joke when you need a break! 😄
        </p>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
          Built with React, Node.js, and Groq's LLaMA model — this project combines modern web development with the power of Large Language Models.
        </p>
        <div className="mt-8 p-6 bg-slate-800 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
          <ul className="text-gray-300 space-y-2 text-sm md:text-base">
            <li><span className="text-white font-medium">Frontend:</span> React.js + Tailwind CSS + Vite</li>
            <li><span className="text-white font-medium">Backend:</span> Node.js + Express</li>
            <li><span className="text-white font-medium">AI Model:</span> LLaMA 3.3 70B via Groq API</li>
            <li><span className="text-white font-medium">3D Avatar:</span> Three.js + VRM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const faqs = [
    { q: "What is Iris?", a: "Iris is a smart study assistant powered by AI that helps students learn, summarize notes, and understand concepts." },
    { q: "Does it remember my previous messages?", a: "Yes! Iris remembers your conversation history within the same session." },
    { q: "What AI model powers this?", a: "It uses LLaMA 3.3 70B, one of the most powerful open source AI models, served via Groq's ultra-fast API." },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 bg-slate-800 rounded-xl">
              <h3 className="text-base font-semibold mb-2">❓ {faq.q}</h3>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Help() {
  const steps = [
    { step: "1", title: "Launch the AI", desc: "Click the 'Launch Iris' button on the home page." },
    { step: "2", title: "Meet your Avatar", desc: "You'll see a friendly 3D AI avatar ready to help!" },
    { step: "3", title: "Type your question", desc: "Type anything in the input box." },
    { step: "4", title: "Get instant answers", desc: "Iris responds instantly with clear explanations." },
    { step: "5", title: "Keep chatting", desc: "Iris remembers context so you can ask follow-ups." },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          How to Use Iris
        </h1>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4 p-5 bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-blue-400 flex-shrink-0">#{s.step}</div>
              <div>
                <h3 className="text-base font-semibold mb-1">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-5 bg-slate-800 rounded-xl mb-12">
          <h2 className="text-lg font-semibold mb-3">Tips</h2>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>Be specific with your questions for better answers</li>
            <li>Paste your notes directly for summaries</li>
            <li>Request practice questions on any topic</li>
            <li>Ask it to create a study plan for your exams!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 px-6 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Contact
        </h1>
        <p className="text-gray-300 text-base mb-8">
          Have feedback, suggestions, or just want to say hi? Feel free to reach out!
        </p>
        <div className="space-y-4">
          <div className="p-5 bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-400">Built by</h3>
            <p className="text-white mt-1">Likitha Sri</p>
          </div>
          <div className="p-5 bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-400">LinkedIn</h3>
            <a href="https://www.linkedin.com/in/t-likitha-sri-167009380/"
              target="_blank" rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm mt-1 block">
              linkedin.com/in/likitha-sri
            </a>
          </div>
          <div className="p-5 bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-400">GitHub</h3>
            <a href="https://github.com/likitha-codes"
              target="_blank" rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm mt-1 block">
              github.com/likitha-codes
            </a>
          </div>
          <div className="p-5 bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-400">Email</h3>
            <a href="mailto:likithasrit@gmail.com"
              className="text-blue-400 hover:text-blue-300 text-sm mt-1 block">
              likithasrit@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ai" element={<Aipage />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/help" element={<Help />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;