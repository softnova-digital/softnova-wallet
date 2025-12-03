/**
 * Production-ready logger utility
 * Logs errors in development, sanitizes in production
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      // In production, don't expose stack traces or sensitive data
      if (this.isDevelopment) {
        return error.stack || error.message;
      }
      return error.message;
    }
    return String(error);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    if (!this.isDevelopment && level === "debug") {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const logEntry: Record<string, unknown> = {
      timestamp,
      level,
      message,
    };
    
    if (context) {
      logEntry.context = context;
    }
    
    if (error) {
      logEntry.error = this.sanitizeError(error);
    }

    switch (level) {
      case "error":
        console.error(JSON.stringify(logEntry));
        break;
      case "warn":
        console.warn(JSON.stringify(logEntry));
        break;
      case "info":
        console.info(JSON.stringify(logEntry));
        break;
      case "debug":
        if (this.isDevelopment) {
          console.debug(JSON.stringify(logEntry));
        }
        break;
    }
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log("error", message, context, error);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }
}

export const logger = new Logger();

