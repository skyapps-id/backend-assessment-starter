import { Router } from "express";
import { db } from "./db";
import { authMiddleware } from "./auth";
import { body, validationResult } from "express-validator";

export const notesRouter = Router();

const createNoteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body is required')
    .isLength({ max: 5000 })
    .withMessage('Body must be less than 5000 characters')
];

notesRouter.get("/", authMiddleware, (req: any, res) => {
  const notes = db
    .prepare(`SELECT * FROM notes WHERE user_id = ?`)
    .all(req.user.userId) as any[];

  const result = notes.map((n) => {
    const author = db
      .prepare(`SELECT email FROM users WHERE id = ?`)
      .get(n.user_id) as any;
    return { ...n, author: author ? author.email : null };
  });

  res.json(result);
});

notesRouter.get("/:id", authMiddleware, (req: any, res) => {
  const note = db
    .prepare(`SELECT * FROM notes WHERE id = ? AND user_id = ?`)
    .get(req.params.id, req.user.userId);
  
  if (!note) {
    return res.status(404).json({ error: "note not found" });
  }
  
  res.json(note);
});

notesRouter.post("/", authMiddleware, createNoteValidation, (req: any, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array() 
    });
  }

  const { title, body } = req.body as any;
  const info = db
    .prepare("INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)")
    .run(req.user.userId, title, body);
  res.json({ id: info.lastInsertRowid });
});
