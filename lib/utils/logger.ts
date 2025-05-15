// Centralized logger utility for FleetFusion
// Usage: import logger from "@/lib/utils/logger";
// Set LOG_LEVEL in .env.local to control output (debug, info, warn, error, none)
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';


const LOG_LEVELS = ["debug", "info", "warn", "error", "none"];
const currentLevel = process.env.LOG_LEVEL || "info";

function shouldLog(level: string) {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(currentLevel);
}

const logger = {
  debug: (...args: any[]) => shouldLog("debug") && console.debug("[DEBUG]", ...args),
  info: (...args: any[]) => shouldLog("info") && console.info("[INFO]", ...args),
  warn: (...args: any[]) => shouldLog("warn") && console.warn("[WARN]", ...args),
  error: (...args: any[]) => shouldLog("error") && console.error("[ERROR]", ...args),
};

export default logger;
