import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { notesRouter } from "./notes";
import { config } from "./config";

const app = express();

app.use(express.json());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/notes", notesRouter);

app.use((err: any, req: any, res: any, next: any) => {
  // Don't expose stack traces in production
  const error = config.nodeEnv === 'production' 
    ? { error: 'Internal server error' }
    : { error: err.message, stack: err.stack };
    
  res.status(500).json(error);
});

app.listen(config.port, () => {
  console.log(`listening on ${config.port}`);
});
