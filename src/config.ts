export const config = {
  jwtSecret: process.env.JWT_SECRET,
  dbPath: process.env.DB_PATH || "notes.db",
  port: Number(process.env.PORT) || 3000,
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
