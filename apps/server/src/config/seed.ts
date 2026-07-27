import sql from "./db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      raw_text TEXT NOT NULL,
      sentiment VARCHAR(20) NOT NULL,
      rating INTEGER DEFAULT 3,
      key_items JSONB NOT NULL DEFAULT '[]',
      requires_action BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 3`;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@restaurant.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${adminEmail}
  `;

  if (existingUser.length === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await sql`
      INSERT INTO users (email, password, role)
      VALUES (${adminEmail}, ${hashedPassword}, 'admin')
    `;
    console.log(`Admin user created: ${adminEmail}`);
  }

  console.log("Database initialized successfully");
}
