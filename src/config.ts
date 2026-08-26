export const config = {
  jwtSecret: process.env.JWT_SECRET,
  dbPath: process.env.DB_PATH || "notes.db",
  port: Number(process.env.PORT) || 3000,
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  nodeEnv: process.env.NODE_ENV || 'development'
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
