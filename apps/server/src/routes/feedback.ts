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

/**
 * @openapi
 * /api/feedback:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit a restaurant review
 *     description: Public endpoint. Accepts a review, processes it with LLM, stores result, and broadcasts via WebSocket.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackRequest'
 *     responses:
 *       201:
 *         description: Feedback processed and saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackResponse'
 *       400:
 *         description: Missing or empty text
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to process feedback
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", async (req, res) => {
  try {
    const { text, rating } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Feedback text is required" });
    }

    const moodRating = typeof rating === "number" ? rating : 3;
    const analysis = await analyzeFeedback(text.trim());

    const result = await sql`
      INSERT INTO feedback (raw_text, sentiment, rating, key_items, requires_action)
      VALUES (${text.trim()}, ${analysis.sentiment}, ${moodRating}, ${JSON.stringify(analysis.key_items)}, ${analysis.requires_action})
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

/**
 * @openapi
 * /api/feedback/insights:
 *   get:
 *     tags: [Feedback]
 *     summary: Get all feedback (Admin only)
 *     description: Protected endpoint. Requires valid admin JWT in Authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all feedback entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedbackResponse'
 *       401:
 *         description: Unauthorized - no token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to fetch insights
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
