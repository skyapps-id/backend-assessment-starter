import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db";
import { config } from "./config";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body as any;

  const row = db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email) as any;

  if (!row) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const passwordMatch = bcrypt.compareSync(password, row.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign({ userId: row.id, email: row.email }, config.jwtSecret);
  res.json({ token });
});

export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
}
