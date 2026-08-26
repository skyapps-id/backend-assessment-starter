import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db";
import { config } from "./config";
import { body, validationResult } from "express-validator";

export const authRouter = Router();

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

authRouter.post("/login", loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array() 
    });
  }

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
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
}
