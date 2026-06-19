type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  timestamp: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL]
}

function createEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  }
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  const ctx = entry.context ? ` [${entry.context}]` : ""
  const data = entry.data !== undefined ? ` ${JSON.stringify(entry.data)}` : ""
  return `${prefix}${ctx} ${entry.message}${data}`
}

async function reportToServer(entry: LogEntry) {
  if (entry.level !== "error" && entry.level !== "warn") return
  try {
    const payload = {
      level: entry.level,
      message: entry.message,
      context: entry.context,
      data: entry.data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    }
    fetch("/api/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Silently fail — don't create infinite log loops
  }
}

function log(level: LogLevel, message: string, context?: string, data?: unknown) {
  if (!shouldLog(level)) return

  const entry = createEntry(level, message, context, data)
  const formatted = formatEntry(entry)

  switch (level) {
    case "debug":
      console.debug(formatted)
      break
    case "info":
      console.info(formatted)
      break
    case "warn":
      console.warn(formatted)
      break
    case "error":
      console.error(formatted)
      reportToServer(entry)
      break
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) =>
    log("debug", message, context, data),

  info: (message: string, context?: string, data?: unknown) =>
    log("info", message, context, data),

  warn: (message: string, context?: string, data?: unknown) =>
    log("warn", message, context, data),

  error: (message: string, context?: string, data?: unknown) =>
    log("error", message, context, data),
}
