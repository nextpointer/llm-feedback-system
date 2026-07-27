import { Router } from "express";
import sql from "../config/db.js";
import { analyzeFeedback } from "../services/llm.js";
import { authenticateAdmin } from "../middleware/auth.js";
import type { Server } from "socket.io";

const router = Router();

let io: Server;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Feedback text is required" });
    }

    const analysis = await analyzeFeedback(text.trim());

    const result = await sql`
      INSERT INTO feedback (raw_text, sentiment, key_items, requires_action)
      VALUES (${text.trim()}, ${analysis.sentiment}, ${JSON.stringify(analysis.key_items)}, ${analysis.requires_action})
      RETURNING *
    `;

    const newFeedback = result[0]!;

    if (io) {
      io.emit("feedback:new", newFeedback);
    }

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ error: "Failed to process feedback" });
  }
});

router.get("/insights", authenticateAdmin, async (_req, res) => {
  try {
    const result = await sql`SELECT * FROM feedback ORDER BY created_at DESC`;
    res.json(result);
  } catch (error) {
    console.error("Insights fetch error:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

export default router;
