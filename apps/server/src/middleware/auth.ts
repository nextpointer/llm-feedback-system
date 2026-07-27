import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const tokenParts = authHeader.split(" ");
  const token = tokenParts[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as unknown as AuthPayload;

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
