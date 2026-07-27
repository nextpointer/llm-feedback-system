import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0]!;
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
