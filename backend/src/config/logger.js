const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

function log(level, context, message, meta) {
  if (LEVELS[level] > currentLevel) return;

  const entry = {
    ts:      new Date().toISOString(),
    level,
    context,
    msg:     message,
  };

  if (meta && Object.keys(meta).length > 0) {
    // Flatten non-Error meta; serialise Error objects explicitly
    if (meta instanceof Error) {
      entry.err = { message: meta.message, stack: meta.stack, name: meta.name };
    } else if (meta.err instanceof Error) {
      const { err, ...rest } = meta;
      Object.assign(entry, rest);
      entry.err = { message: err.message, stack: err.stack, name: err.name };
    } else {
      Object.assign(entry, meta);
    }
  }

  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

/**
 * Returns a logger bound to a specific context (module/file name).
 * Usage:
 *   const logger = createLogger("leaderboardController");
 *   logger.info("cache hit", { key });
 *   logger.error("DB query failed", { err, tournamentId });
 */
export const createLogger = (context) => ({
  error: (msg, meta) => log("error", context, msg, meta),
  warn:  (msg, meta) => log("warn",  context, msg, meta),
  info:  (msg, meta) => log("info",  context, msg, meta),
  debug: (msg, meta) => log("debug", context, msg, meta),
});
