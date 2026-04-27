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
          content: "You are Iris, a smart and friendly AI study companion. Help students learn, summarize notes, explain concepts, generate questions, and create study plans. Be warm, encouraging and concise.",
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

app.listen(5000, () => console.log("Server running on port 5000"));