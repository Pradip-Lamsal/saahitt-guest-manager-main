/**
 * Secure Logger Utility
 * Prevents sensitive data exposure in production console logs
 */

type LogLevel = "log" | "error" | "warn" | "info" | "debug";

interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
}

type LogArgument =
  | string
  | number
  | boolean
  | Error
  | Record<string, unknown>
  | null
  | undefined;

class SecureLogger {
  private static isDevelopment = import.meta.env.DEV;
  private static errorService =
    "https://your-error-monitoring-service.com/api/errors";

  /**
   * Safe logging for development, silent in production
   */
  static log(...args: LogArgument[]): void {
    if (this.isDevelopment) {
      console.log("[DEV]", ...args);
    }
  }

  /**
   * Safe error logging with production error reporting
   */
  static error(...args: LogArgument[]): void {
    if (this.isDevelopment) {
      console.error("[DEV ERROR]", ...args);
    } else {
      // In production, send errors to monitoring service instead of console
      this.sendToErrorService({
        message: args.map((arg) => String(arg)).join(" "),
        timestamp: new Date().toISOString(),
        stack: args.find((arg) => arg instanceof Error)?.stack,
      });
    }
  }

  /**
   * Safe warning logging
   */
  static warn(...args: LogArgument[]): void {
    if (this.isDevelopment) {
      console.warn("[DEV WARN]", ...args);
    }
  }

  /**
   * Safe info logging
   */
  static info(...args: LogArgument[]): void {
    if (this.isDevelopment) {
      console.info("[DEV INFO]", ...args);
    }
  }

  /**
   * Safe debug logging
   */
  static debug(...args: LogArgument[]): void {
    if (this.isDevelopment) {
      console.debug("[DEV DEBUG]", ...args);
    }
  }

  /**
   * Send errors to monitoring service in production
   */
  private static async sendToErrorService(
    errorDetails: ErrorDetails
  ): Promise<void> {
    try {
      // Only send in production and if error service is configured
      if (!this.isDevelopment && this.errorService) {
        await fetch(this.errorService, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...errorDetails,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (e) {
      // Silently fail if error reporting fails
      // Don't use console.error here to avoid recursion
    }
  }

  /**
   * Sanitize sensitive data before logging
   */
  static sanitizeForLogging(
    data: Record<string, unknown>
  ): Record<string, unknown> {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sensitiveKeys = [
      "password",
      "token",
      "auth",
      "authorization",
      "secret",
      "key",
      "email",
      "phone",
      "ssn",
      "credit",
      "card",
      "cvv",
      "session",
    ];

    const sanitized = { ...data };

    for (const key in sanitized) {
      if (
        sensitiveKeys.some((sensitive) =>
          key.toLowerCase().includes(sensitive.toLowerCase())
        )
      ) {
        sanitized[key] = "[REDACTED]";
      } else if (
        typeof sanitized[key] === "object" &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeForLogging(
          sanitized[key] as Record<string, unknown>
        );
      }
    }

    return sanitized;
  }

  /**
   * Log API responses safely (redacts sensitive data)
   */
  static logApiResponse(
    endpoint: string,
    response: Record<string, unknown>
  ): void {
    if (this.isDevelopment) {
      const sanitizedResponse = this.sanitizeForLogging(response);
      console.log(`[API Response] ${endpoint}:`, sanitizedResponse);
    }
  }

  /**
   * Log authentication events safely
   */
  static logAuthEvent(event: string, details?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const sanitizedDetails = details ? this.sanitizeForLogging(details) : {};
      console.log(`[AUTH EVENT] ${event}:`, sanitizedDetails);
    }
  }
}

export default SecureLogger;
