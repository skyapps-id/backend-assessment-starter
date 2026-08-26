import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { notesRouter } from "./notes";
import { config } from "./config";
import { requestLogger } from "./logging";

const app = express();

app.use(express.json());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));

// Request logging middleware
app.use(requestLogger);

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/notes", notesRouter);

app.use((err: any, req: any, res: any, next: any) => {
  // Log errors
  console.error(`[error] ${new Date().toISOString()} | ${req.method} ${req.path} | ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Don't expose stack traces in production
  const error = config.nodeEnv === 'production'
    ? { error: 'Internal server error' }
    : { error: err.message, stack: err.stack };

  res.status(500).json(error);
});

app.listen(config.port, () => {
  console.log(`listening on ${config.port}`);
});
