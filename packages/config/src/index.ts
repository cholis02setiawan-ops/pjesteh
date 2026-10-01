// packages/config/src/index.ts
export const APP_CONFIG = {
  port: parseInt(process.env["PORT"] || "4000", 10),
  databaseUrl: process.env["DATABASE_URL"] || "",
  redisUrl: process.env["REDIS_URL"] || "redis://localhost:6379",
  nodeEnv: process.env["NODE_ENV"] || "development",
  corsOrigin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
  jwtSecret: process.env["JWT_SECRET"] || "change-me-in-production",
  jwtRefreshSecret: process.env["JWT_REFRESH_SECRET"] || "change-me-in-production",
  apiBaseUrl: process.env["API_BASE_URL"] || "http://localhost:4000",
  outboxPollInterval: parseInt(process.env["OUTBOX_POLL_INTERVAL"] || "5000", 10),
  maxOfflineQueueSize: parseInt(process.env["MAX_OFFLINE_QUEUE_SIZE"] || "200", 10),
  maxOfflineDurationHours: parseInt(process.env["MAX_OFFLINE_DURATION_HOURS"] || "24", 10),
} as const;
