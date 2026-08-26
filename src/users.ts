import { Router } from "express";
import { db, hashPassword } from "./db";
import { body, validationResult } from "express-validator";

export const usersRouter = Router();

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];

usersRouter.post("/register", registerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array() 
    });
  }

  const { email, password } = req.body as any;

  const existing = db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email);
  if (existing) {
    return res.status(409).json({ error: "email taken" });
  }

  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
    email,
    hashPassword(password)
  );
  res.json({ ok: true });
});
