/**
 * Secure Session Management Utility
 * Provides enhanced session security and monitoring
 */

interface SessionData {
  userId: string;
  email: string;
  lastActivity: number;
  sessionStart: number;
  isValid: boolean;
}

interface SecurityEvent {
  type: "LOGIN" | "LOGOUT" | "SESSION_EXPIRED" | "SUSPICIOUS_ACTIVITY";
  userId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_WARNING_TIME = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_IDLE_TIME = 60 * 60 * 1000; // 1 hour
  private static sessionData: SessionData | null = null;
  private static warningShown = false;
  private static checkInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize session monitoring
   */
  static initializeSession(userId: string, email: string): void {
    this.sessionData = {
      userId,
      email,
      lastActivity: Date.now(),
      sessionStart: Date.now(),
      isValid: true,
    };

    this.startSessionMonitoring();
    this.logSecurityEvent("LOGIN", userId);
  }

  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    if (this.sessionData) {
      this.sessionData.lastActivity = Date.now();
      this.warningShown = false; // Reset warning flag
    }
  }

  /**
   * Check if session is still valid
   */
  static isSessionValid(): boolean {
    if (!this.sessionData) return false;

    const now = Date.now();
    const timeSinceActivity = now - this.sessionData.lastActivity;
    const timeSinceStart = now - this.sessionData.sessionStart;

    // Check for idle timeout
    if (timeSinceActivity > this.MAX_IDLE_TIME) {
      this.invalidateSession("IDLE_TIMEOUT");
      return false;
    }

    // Check for maximum session duration (8 hours)
    if (timeSinceStart > 8 * 60 * 60 * 1000) {
      this.invalidateSession("MAX_DURATION");
      return false;
    }

    return this.sessionData.isValid;
  }

  /**
   * Get time until session warning
   */
  static getTimeUntilWarning(): number {
    if (!this.sessionData) return 0;

    const now = Date.now();
    const timeSinceActivity = now - this.sessionData.lastActivity;
    const timeUntilWarning =
      this.MAX_IDLE_TIME - this.SESSION_WARNING_TIME - timeSinceActivity;

    return Math.max(0, timeUntilWarning);
  }

  /**
   * Get time until session expiry
   */
  static getTimeUntilExpiry(): number {
    if (!this.sessionData) return 0;

    const now = Date.now();
    const timeSinceActivity = now - this.sessionData.lastActivity;
    const timeUntilExpiry = this.MAX_IDLE_TIME - timeSinceActivity;

    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Invalidate current session
   */
  static invalidateSession(reason: string): void {
    if (this.sessionData) {
      this.sessionData.isValid = false;
      this.logSecurityEvent("SESSION_EXPIRED", this.sessionData.userId, {
        reason,
      });
    }

    this.stopSessionMonitoring();
    this.clearSessionData();
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    if (this.sessionData) {
      this.logSecurityEvent("LOGOUT", this.sessionData.userId);
    }

    this.stopSessionMonitoring();
    this.clearSessionData();
  }

  /**
   * Get current session info (sanitized)
   */
  static getSessionInfo(): {
    isValid: boolean;
    timeUntilExpiry: number;
    shouldShowWarning: boolean;
  } {
    const isValid = this.isSessionValid();
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const shouldShowWarning =
      timeUntilExpiry <= this.SESSION_WARNING_TIME && !this.warningShown;

    if (shouldShowWarning) {
      this.warningShown = true;
    }

    return {
      isValid,
      timeUntilExpiry,
      shouldShowWarning,
    };
  }

  /**
   * Detect suspicious activity patterns
   */
  static detectSuspiciousActivity(): boolean {
    if (!this.sessionData) return false;

    // Check for rapid requests (potential automation)
    const recentRequests = this.getRecentActivityCount(60000); // Last minute
    if (recentRequests > 100) {
      this.logSecurityEvent("SUSPICIOUS_ACTIVITY", this.sessionData.userId, {
        reason: "RAPID_REQUESTS",
        count: recentRequests,
      });
      return true;
    }

    // Check for unusual session duration
    const sessionDuration = Date.now() - this.sessionData.sessionStart;
    if (sessionDuration > 12 * 60 * 60 * 1000) {
      // More than 12 hours
      this.logSecurityEvent("SUSPICIOUS_ACTIVITY", this.sessionData.userId, {
        reason: "LONG_SESSION",
        duration: sessionDuration,
      });
      return true;
    }

    return false;
  }

  /**
   * Start session monitoring
   */
  private static startSessionMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        // Session expired, trigger cleanup
        this.invalidateSession("TIMEOUT");

        // Notify application about session expiry
        window.dispatchEvent(new CustomEvent("sessionExpired"));
      }

      // Check for suspicious activity
      if (this.detectSuspiciousActivity()) {
        window.dispatchEvent(new CustomEvent("suspiciousActivity"));
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop session monitoring
   */
  private static stopSessionMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clear all session data
   */
  private static clearSessionData(): void {
    this.sessionData = null;
    this.warningShown = false;

    // Clear any stored session data
    try {
      localStorage.removeItem("sessionToken");
      sessionStorage.clear();
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Get recent activity count (mock implementation)
   */
  private static getRecentActivityCount(timeWindow: number): number {
    // In a real implementation, this would track actual API requests
    // For now, return a reasonable default
    return 0;
  }

  /**
   * Log security events
   */
  private static logSecurityEvent(
    type: SecurityEvent["type"],
    userId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: SecurityEvent = {
      type,
      userId,
      timestamp: Date.now(),
      metadata,
    };

    // In a real implementation, send to security monitoring service
    console.log("[SECURITY EVENT]", event);

    // Store in local history for debugging (development only)
    if (import.meta.env.DEV) {
      const events = JSON.parse(localStorage.getItem("securityEvents") || "[]");
      events.push(event);
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      localStorage.setItem("securityEvents", JSON.stringify(events));
    }
  }

  /**
   * Set up activity listeners
   */
  static setupActivityListeners(): void {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.updateActivity();
        },
        { passive: true }
      );
    });

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Page hidden, don't update activity
      } else {
        // Page visible again, update activity
        this.updateActivity();
      }
    });
  }

  /**
   * Clean up all listeners and intervals
   */
  static cleanup(): void {
    this.stopSessionMonitoring();
    // Remove event listeners would require storing references
    // For simplicity, we'll let them remain (they'll be cleaned up on page unload)
  }
}

export default SessionManager;
