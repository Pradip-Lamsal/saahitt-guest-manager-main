// Define validation rules interface
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  sanitize?: boolean;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, string>;
}

export class InputValidator {
  /**
   * Email validation with comprehensive regex
   */
  static isValidEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Phone number validation (international format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ""));
  }

  /**
   * Name validation (letters, spaces, hyphens, apostrophes only)
   */
  static isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s\-'.]+$/;
    return nameRegex.test(name) && name.trim().length > 0;
  }

  /**
   * Password strength validation
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 20;
    else feedback.push("Password must be at least 8 characters long");

    if (password.length >= 12) score += 10;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Password must contain lowercase letters");

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Password must contain uppercase letters");

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push("Password must contain numbers");

    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    else feedback.push("Password must contain special characters");

    // Common passwords check
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push("Password is too common");
    }

    // Repetitive patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push("Avoid repetitive characters");
    }

    return {
      isValid: score >= 80 && feedback.length === 0,
      score: Math.min(100, Math.max(0, score)),
      feedback,
    };
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    // Simple HTML sanitization - remove all HTML tags and encode entities
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  /**
   * Remove potentially dangerous characters
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>"'%;()&+]/g, "") // Remove potentially dangerous chars
      .replace(/\s+/g, " "); // Normalize whitespace
  }

  /**
   * Validate against common XSS patterns
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Validate and sanitize form data based on schema
   */
  static validateForm(
    data: Record<string, string>,
    schema: ValidationSchema
  ): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, string> = {};

    for (const [field, value] of Object.entries(data)) {
      const rule = schema[field];
      if (!rule) continue;

      let fieldValue = value;

      // Sanitize if required
      if (rule.sanitize) {
        fieldValue = this.sanitizeInput(fieldValue);
      }

      // Check for XSS
      if (this.containsXSS(fieldValue)) {
        errors.push(`${field} contains potentially malicious content`);
        continue;
      }

      // Required field check
      if (rule.required && (!fieldValue || fieldValue.trim().length === 0)) {
        errors.push(`${field} is required`);
        continue;
      }

      // Length checks
      if (rule.minLength && fieldValue.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }

      if (rule.maxLength && fieldValue.length > rule.maxLength) {
        errors.push(`${field} must not exceed ${rule.maxLength} characters`);
      }

      // Pattern check
      if (rule.pattern && !rule.pattern.test(fieldValue)) {
        errors.push(`${field} format is invalid`);
      }

      // Custom validation
      if (rule.custom && !rule.custom(fieldValue)) {
        errors.push(`${field} validation failed`);
      }

      sanitizedData[field] = fieldValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
    };
  }

  /**
   * Rate limiting check (client-side)
   */
  static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const attempts = stored ? JSON.parse(stored) : [];

      // Clean old attempts
      const validAttempts = attempts.filter(
        (time: number) => now - time < windowMs
      );

      if (validAttempts.length >= limit) {
        return false; // Rate limit exceeded
      }

      validAttempts.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validAttempts));

      return true;
    } catch {
      // If localStorage fails, allow the request
      return true;
    }
  }

  /**
   * Predefined validation schemas for common forms
   */
  static readonly schemas = {
    guest: {
      first_name: {
        required: true,
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-'.]+$/,
        sanitize: true,
      },
      last_name: {
        required: false,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-'.]*$/,
        sanitize: true,
      },
      email: {
        required: false,
        maxLength: 254,
        custom: (value: string) =>
          value === "" || InputValidator.isValidEmail(value),
        sanitize: true,
      },
      phone: {
        required: false,
        maxLength: 20,
        custom: (value: string) =>
          value === "" || InputValidator.isValidPhone(value),
        sanitize: true,
      },
      notes: {
        required: false,
        maxLength: 500,
        sanitize: true,
      },
    },
    event: {
      name: {
        required: true,
        minLength: 1,
        maxLength: 100,
        sanitize: true,
      },
      description: {
        required: false,
        maxLength: 1000,
        sanitize: true,
      },
    },
    auth: {
      email: {
        required: true,
        custom: InputValidator.isValidEmail,
        sanitize: true,
      },
      password: {
        required: true,
        minLength: 8,
        maxLength: 128,
      },
      first_name: {
        required: true,
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-'.]+$/,
        sanitize: true,
      },
      last_name: {
        required: true,
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-'.]+$/,
        sanitize: true,
      },
    },
  };
}

export default InputValidator;
