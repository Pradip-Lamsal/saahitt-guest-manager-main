/**
 * Security Configuration
 * Central configuration for all security settings
 */

export interface SecurityConfig {
  // CSP Configuration
  csp: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
  };

  // Session Configuration
  session: {
    timeoutMinutes: number;
    warningMinutes: number;
    maxInactivityMinutes: number;
    enableSecurityMonitoring: boolean;
  };

  // Input Validation
  validation: {
    maxInputLength: number;
    allowedFileTypes: string[];
    maxFileSize: number; // in bytes
    enableXssProtection: boolean;
    enableSqlInjectionProtection: boolean;
  };

  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    maxAttempts: number;
    windowMinutes: number;
    blockDurationMinutes: number;
  };

  // Logging
  logging: {
    enableSecureLogging: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
    enableErrorReporting: boolean;
    sanitizeLogs: boolean;
  };

  // Security Headers
  headers: {
    enableHSTS: boolean;
    enableNoSniff: boolean;
    enableFrameOptions: boolean;
    enableXSSProtection: boolean;
    enableReferrerPolicy: boolean;
  };

  // Development Settings
  development: {
    enableSecurityMonitor: boolean;
    showSecurityWarnings: boolean;
    enableDebugMode: boolean;
  };
}

export const defaultSecurityConfig: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      "https://js.stripe.com",
      "https://checkout.stripe.com",
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
      "https://fonts.googleapis.com",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://*.supabase.co",
      "https://*.googleapis.com",
    ],
    connectSrc: [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.stripe.com",
      "https://checkout.stripe.com",
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", "https://*.supabase.co"],
    frameSrc: [
      "'self'",
      "https://js.stripe.com",
      "https://checkout.stripe.com",
    ],
  },

  session: {
    timeoutMinutes: 480, // 8 hours
    warningMinutes: 10,
    maxInactivityMinutes: 60,
    enableSecurityMonitoring: true,
  },

  validation: {
    maxInputLength: 10000,
    allowedFileTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    enableXssProtection: true,
    enableSqlInjectionProtection: true,
  },

  rateLimiting: {
    enabled: true,
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30,
  },

  logging: {
    enableSecureLogging: true,
    logLevel: process.env.NODE_ENV === "development" ? "debug" : "error",
    enableErrorReporting: true,
    sanitizeLogs: true,
  },

  headers: {
    enableHSTS: true,
    enableNoSniff: true,
    enableFrameOptions: true,
    enableXSSProtection: true,
    enableReferrerPolicy: true,
  },

  development: {
    enableSecurityMonitor: process.env.NODE_ENV === "development",
    showSecurityWarnings: process.env.NODE_ENV === "development",
    enableDebugMode: process.env.NODE_ENV === "development",
  },
};

/**
 * Get the current security configuration
 * Merges default config with environment-specific overrides
 */
export const getSecurityConfig = (): SecurityConfig => {
  // In a real app, you might load this from environment variables
  // or a remote configuration service
  return defaultSecurityConfig;
};

/**
 * Generate CSP header string from configuration
 */
export const generateCSPHeader = (config: SecurityConfig): string => {
  const directives = [
    `default-src ${config.csp.defaultSrc.join(" ")}`,
    `script-src ${config.csp.scriptSrc.join(" ")}`,
    `style-src ${config.csp.styleSrc.join(" ")}`,
    `img-src ${config.csp.imgSrc.join(" ")}`,
    `connect-src ${config.csp.connectSrc.join(" ")}`,
    `font-src ${config.csp.fontSrc.join(" ")}`,
    `object-src ${config.csp.objectSrc.join(" ")}`,
    `media-src ${config.csp.mediaSrc.join(" ")}`,
    `frame-src ${config.csp.frameSrc.join(" ")}`,
  ];

  return directives.join("; ");
};

/**
 * Security middleware configuration for headers
 */
export const getSecurityHeaders = (
  config: SecurityConfig
): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (config.headers.enableHSTS) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
  }

  if (config.headers.enableNoSniff) {
    headers["X-Content-Type-Options"] = "nosniff";
  }

  if (config.headers.enableFrameOptions) {
    headers["X-Frame-Options"] = "DENY";
  }

  if (config.headers.enableXSSProtection) {
    headers["X-XSS-Protection"] = "1; mode=block";
  }

  if (config.headers.enableReferrerPolicy) {
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }

  // Always add CSP
  headers["Content-Security-Policy"] = generateCSPHeader(config);

  return headers;
};

/**
 * Validate if the current environment meets security requirements
 */
export const validateSecurityEnvironment = (): {
  isSecure: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    window.location.protocol !== "https:"
  ) {
    errors.push("HTTPS is required in production");
  }

  // Check for secure cookies support
  if (process.env.NODE_ENV === "production" && !window.isSecureContext) {
    warnings.push(
      "Secure context is not available - some features may not work"
    );
  }

  // Check for required APIs
  if (!window.crypto || !window.crypto.subtle) {
    errors.push("Web Crypto API is not available");
  }

  // Check local storage availability
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
  } catch {
    warnings.push("Local storage is not available");
  }

  return {
    isSecure: errors.length === 0,
    warnings,
    errors,
  };
};

/**
 * Initialize security configuration
 * Should be called early in the app lifecycle
 */
export const initializeSecurity = (): void => {
  const config = getSecurityConfig();
  const validation = validateSecurityEnvironment();

  // Log security status
  if (config.development.enableDebugMode) {
    console.group("🔒 Security Configuration");
    console.log("Config:", config);
    console.log("Validation:", validation);
    console.groupEnd();
  }

  // Warn about security issues
  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => {
      console.warn("⚠️ Security Warning:", warning);
    });
  }

  // Error on critical security issues
  if (validation.errors.length > 0) {
    validation.errors.forEach((error) => {
      console.error("🚨 Security Error:", error);
    });

    // In production, you might want to redirect to an error page
    // or disable certain features
  }

  // Set up global security event listeners
  if (config.session.enableSecurityMonitoring) {
    setupSecurityMonitoring();
  }
};

/**
 * Set up security monitoring
 */
const setupSecurityMonitoring = (): void => {
  // Monitor for developer tools
  let devtools = false;
  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > 200 ||
      window.outerWidth - window.innerWidth > 200
    ) {
      if (!devtools) {
        devtools = true;
        window.dispatchEvent(
          new CustomEvent("securityEvent", {
            detail: { type: "devtools-opened" },
          })
        );
      }
    } else {
      devtools = false;
    }
  }, 1000);

  // Monitor for suspicious activity
  let rapidClicks = 0;
  window.addEventListener("click", () => {
    rapidClicks++;
    setTimeout(() => rapidClicks--, 1000);

    if (rapidClicks > 10) {
      window.dispatchEvent(
        new CustomEvent("suspiciousActivity", {
          detail: { type: "rapid-clicking", count: rapidClicks },
        })
      );
    }
  });

  // Monitor for console access attempts in production
  if (process.env.NODE_ENV === "production") {
    const originalConsole = { ...console };
    Object.keys(console).forEach((key) => {
      const consoleKey = key as keyof Console;
      if (typeof console[consoleKey] === "function") {
        const originalMethod = (originalConsole as Record<string, unknown>)[
          key
        ] as (...args: unknown[]) => unknown;
        // Override console methods to detect usage
        (console as unknown as Record<string, unknown>)[key] = function (
          ...args: unknown[]
        ) {
          window.dispatchEvent(
            new CustomEvent("securityEvent", {
              detail: { type: "console-access", method: key },
            })
          );
          return originalMethod.apply(console, args);
        };
      }
    });
  }
};

export default {
  getSecurityConfig,
  generateCSPHeader,
  getSecurityHeaders,
  validateSecurityEnvironment,
  initializeSecurity,
};
