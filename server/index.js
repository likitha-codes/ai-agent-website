import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  family: 4
})
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB error:", err));

// Schema
const messageSchema = new mongoose.Schema({
  role: String,
  content: String,
});

const chatSchema = new mongoose.Schema({
  sessionId: String,
  title: String,
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CHAT ROUTE
app.post("/api/chat", async (req, res) => {
  const { messages, sessionId } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Iris, an intelligent, friendly, and supportive AI study companion designed to help students learn effectively.

Your personality:
- Warm, encouraging, and patient
- Clear, intelligent, and approachable
- Professional, but never robotic
- Conversational and engaging

Your primary responsibilities:
- Explain concepts in simple, easy-to-understand language
- Break down complex topics step by step
- Summarize notes, articles, and study material clearly
- Generate quizzes, practice questions, and flashcards
- Help create personalized study plans and revision schedules
- Assist with academic writing, brainstorming, and problem-solving
- Encourage curiosity and independent thinking

Response guidelines:
- Adapt explanations to the user's level of understanding
- Use examples and analogies whenever helpful
- Be concise for simple questions and detailed for complex ones
- Format answers neatly using bullet points, headings, or numbered steps when appropriate
- If a user seems stressed or frustrated, respond with empathy and encouragement
- For factual or academic content, prioritize accuracy and clarity

Behavior rules:
- Stay focused on being a helpful study companion
- Do not provide harmful, illegal, or unethical advice
- If you do not know something, admit it honestly and offer the best possible guidance
- Encourage learning rather than simply giving answers when educational value matters

Your goal is to make learning interactive, enjoyable, and effective, while acting like a reliable study partner students can trust.`
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0].message.content;

    if (sessionId) {
      await Chat.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: "user", content: messages[messages.length - 1].content },
              { role: "assistant", content: reply },
            ],
          },
          $set: {
            updatedAt: new Date(),
            title: messages[0].content.slice(0, 40),
          },
        },
        { upsert: true }
      );
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET ALL CHATS
app.get("/api/chats", async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .select("sessionId title updatedAt messages");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// GET SINGLE CHAT
app.get("/api/chats/:sessionId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ sessionId: req.params.sessionId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// DELETE CHAT
app.delete("/api/chats/:sessionId", async (req, res) => {
  try {
    await Chat.findOneAndDelete({ sessionId: req.params.sessionId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

app.get("/ping", (req, res) => res.send("awake"));

// Keep alive — ping every 14 minutes so free tier never sleeps
import https from "https";
setInterval(() => {
  https.get("https://iris-ai-backend-onka.onrender.com/ping", (res) => {
    console.log("Ping sent, status:", res.statusCode);
  }).on("error", (e) => {
    console.log("Ping error:", e.message);
  });
}, 14 * 60 * 1000);

app.listen(5000, () => console.log("Server running on port 5000"));