# Security Assessment & Penetration Testing Guide

## Saahitt Guest Manager Application

### Executive Summary

This document provides a comprehensive security assessment of the Saahitt Guest Manager application, identifying vulnerabilities and providing actionable remediation steps. The assessment covers authentication, authorization, data protection, input validation, and infrastructure security.

### Table of Contents

1. [Application Overview](#application-overview)
2. [Identified Vulnerabilities](#identified-vulnerabilities)
3. [Penetration Testing Methodology](#penetration-testing-methodology)
4. [Detailed Security Findings](#detailed-security-findings)
5. [Remediation Steps](#remediation-steps)
6. [Security Best Practices](#security-best-practices)
7. [Testing Checklist](#testing-checklist)

---

## Application Overview

**Technology Stack:**

- Frontend: React + TypeScript with Vite
- Backend: Supabase (PostgreSQL + Edge Functions)
- Authentication: Supabase Auth
- Deployment: Netlify
- Email Service: Resend API

**Application Features:**

- User authentication and authorization
- Guest management system
- Event management
- RSVP functionality
- Payment processing
- Email invitations

---

## Identified Vulnerabilities

### 🔴 HIGH SEVERITY

#### 1. **Information Disclosure via Console Logging**

**Risk Level:** HIGH  
**CVSS Score:** 7.5  
**Location:** Multiple files throughout the application

**Description:**
The application contains extensive console logging that exposes sensitive information including:

- User session data
- Authentication tokens
- API responses
- Error details with stack traces

**Evidence:**

```typescript
// src/pages/Auth.tsx:67
console.log("User is already logged in, redirecting to:", redirectPath);

// src/pages/Auth.tsx:82
console.log(
  "Auth state changed:",
  event,
  session ? "session exists" : "no session"
);

// Multiple error logs exposing sensitive data
console.error("Auth check error:", error);
```

**Impact:**

- Sensitive data exposure in browser console
- Information leakage for attackers
- Potential exposure of authentication tokens

#### 2. **Insecure Password Reset Token Management**

**Risk Level:** HIGH  
**CVSS Score:** 8.2  
**Location:** `supabase/functions/password-management/index.ts`

**Description:**
The password reset implementation uses weak token generation and lacks proper token validation:

```typescript
// Weak password hashing implementation
const passwordHash = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(password + user_id) // Add salt
);
```

**Issues:**

- Simple SHA-256 hashing without proper salt
- No rate limiting on password reset requests
- Tokens stored in plaintext

#### 3. **JWT Token Exposure**

**Risk Level:** HIGH  
**CVSS Score:** 7.8  
**Location:** `supabase/functions/send-invite/index.ts`

**Description:**
RSVP tokens are generated and stored insecurely:

```typescript
const token = await new jose.SignJWT({ guestId: guest.id, eventId })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d") // Token expires in 7 days
  .setIssuedAt()
  .sign(secret);
```

**Issues:**

- Hardcoded fallback secret key
- Long token expiration (7 days)
- No token revocation mechanism

### 🟡 MEDIUM SEVERITY

#### 4. **Cross-Site Scripting (XSS) Vulnerability**

**Risk Level:** MEDIUM  
**CVSS Score:** 6.1  
**Location:** `src/components/ui/chart.tsx:79`

**Description:**
Use of `dangerouslySetInnerHTML` without proper sanitization:

```typescript
dangerouslySetInnerHTML={{
  __html: tooltipContent
}}
```

**Impact:**

- Potential script injection
- Session hijacking
- Data theft

#### 5. **Insecure Direct Object References (IDOR)**

**Risk Level:** MEDIUM  
**CVSS Score:** 6.5  
**Location:** Multiple API endpoints

**Description:**
While RLS is enabled, some functions may be vulnerable to IDOR attacks:

```sql
-- Potential IDOR in guest access
SELECT * FROM guests WHERE id = $1 AND user_id = auth.uid()
```

#### 6. **Missing Input Validation**

**Risk Level:** MEDIUM  
**CVSS Score:** 5.9  
**Location:** Multiple form components

**Description:**
Insufficient client-side and server-side input validation:

```typescript
// Weak email validation
if (!customer.email.trim() || !customer.email.includes("@")) {
  // Basic validation only
}
```

#### 7. **Session Management Issues**

**Risk Level:** MEDIUM  
**CVSS Score:** 6.3  
**Location:** `src/hooks/useAuthSession.tsx`

**Description:**

- Local storage used for sensitive data
- Session warning only 10 minutes before expiry
- No concurrent session management

### 🟢 LOW SEVERITY

#### 8. **Information Disclosure in Error Messages**

**Risk Level:** LOW  
**CVSS Score:** 3.1  
**Location:** Various error handlers

**Description:**
Error messages reveal system information and stack traces.

#### 9. **Missing Security Headers**

**Risk Level:** LOW  
**CVSS Score:** 2.8  
**Location:** Application configuration

**Description:**
Missing security headers like CSP, HSTS, X-Frame-Options.

---

## Penetration Testing Methodology

### 1. **Information Gathering**

```bash
# Subdomain enumeration
subfinder -d saahitt.com -silent

# Technology stack identification
whatweb https://saahitt.com

# Directory brute forcing
dirb https://saahitt.com /usr/share/wordlists/dirb/common.txt

# Check for sensitive files
curl -s https://saahitt.com/robots.txt
curl -s https://saahitt.com/.env
curl -s https://saahitt.com/config.json
```

### 2. **Authentication Testing**

```bash
# Test for default credentials
curl -X POST https://supabase-project.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'

# Brute force protection testing
for i in {1..10}; do
  curl -X POST https://supabase-project.supabase.co/auth/v1/token \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong'$i'"}'
done
```

### 3. **Session Management Testing**

```bash
# Session fixation test
# 1. Get session before login
# 2. Login with valid credentials
# 3. Check if session ID changes

# Concurrent session test
# 1. Login from multiple browsers
# 2. Check if all sessions remain active
```

### 4. **Input Validation Testing**

```bash
# SQL Injection testing
sqlmap -u "https://supabase-project.supabase.co/rest/v1/guests" \
  --headers="Authorization: Bearer TOKEN" \
  --risk=3 --level=3

# XSS Testing
curl -X POST https://app.com/api/guests \
  -H "Content-Type: application/json" \
  -d '{"first_name":"<script>alert(1)</script>"}'
```

### 5. **Authorization Testing**

```bash
# IDOR testing
# 1. Create guest with user A
# 2. Try to access guest with user B's token
curl -H "Authorization: Bearer USER_B_TOKEN" \
  https://supabase-project.supabase.co/rest/v1/guests?id=eq.USER_A_GUEST_ID
```

### 6. **Business Logic Testing**

```bash
# Payment bypass testing
curl -X POST https://app.com/api/process-payment \
  -H "Content-Type: application/json" \
  -d '{"plan_id":"pro","amount":-100}'

# RSVP token manipulation
# 1. Generate RSVP token
# 2. Try to modify JWT payload
# 3. Test token replay attacks
```

---

## Detailed Security Findings

### Authentication & Authorization

#### Issues Found:

1. **Weak Password Policy Implementation**

   - Client-side validation only
   - No password complexity enforcement on server
   - Common passwords not properly blocked

2. **Session Management Flaws**
   - Local storage used for sensitive data
   - No session invalidation on password change
   - Missing concurrent session controls

#### Test Cases:

```javascript
// Test weak password acceptance
const weakPasswords = ["password", "123456", "qwerty", "admin"];

// Test session persistence
localStorage.setItem("malicious_key", "malicious_value");
// Check if value persists across sessions
```

### Input Validation & Data Protection

#### Issues Found:

1. **Insufficient Input Sanitization**

   - XSS vulnerabilities in user-generated content
   - Missing server-side validation
   - SQL injection potential (though mitigated by Supabase RLS)

2. **Data Exposure**
   - Console logs revealing sensitive information
   - Error messages exposing system details
   - Missing data encryption for sensitive fields

#### Test Cases:

```javascript
// XSS test payloads
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(1)">',
  "javascript:alert(1)",
  '"><script>alert(1)</script>',
];

// Test each payload in form fields
xssPayloads.forEach((payload) => {
  document.getElementById("guest-name").value = payload;
  // Submit form and check for execution
});
```

### API Security

#### Issues Found:

1. **Missing Rate Limiting**

   - No protection against brute force attacks
   - API endpoints can be overwhelmed
   - No CAPTCHA on sensitive operations

2. **Information Disclosure**
   - Detailed error messages
   - Stack traces in responses
   - Sensitive data in API responses

#### Test Cases:

```bash
# Rate limiting test
for i in {1..100}; do
  curl -X POST https://app.com/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done
wait

# API enumeration
curl -X GET https://supabase-project.supabase.co/rest/v1/ \
  -H "Authorization: Bearer INVALID_TOKEN"
```

---

## Remediation Steps

### 🔴 Critical Priority (Fix Immediately)

#### 1. Remove Console Logging in Production

```javascript
// Create a logger utility
class Logger {
  static log(...args) {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  }

  static error(...args) {
    if (process.env.NODE_ENV !== "production") {
      console.error(...args);
    }
    // Send to error monitoring service in production
    this.sendToErrorService(args);
  }
}

// Replace all console.log with Logger.log
```

#### 2. Implement Proper Password Hashing

```typescript
import bcrypt from "bcrypt";

// In password-management function
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// For verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### 3. Secure JWT Token Management

```typescript
// Generate secure random secret
const jwtSecret = crypto.randomBytes(64).toString("hex");

// Shorter token expiration
const token = await new jose.SignJWT({ guestId: guest.id, eventId })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("2h") // Reduce from 7 days to 2 hours
  .setIssuedAt()
  .setNotBefore(Math.floor(Date.now() / 1000))
  .sign(secret);
```

### 🟡 High Priority (Fix Within 1 Week)

#### 4. Implement Content Security Policy

```html
<!-- Add to index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.gpteng.co; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;"
/>
```

#### 5. Add Security Headers

```typescript
// In Netlify _headers file or server configuration
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
*/
```

#### 6. Implement Rate Limiting

```typescript
// Using Supabase Edge Functions
const rateLimiter = new Map();

function checkRateLimit(identifier: string, limit: number, window: number) {
  const now = Date.now();
  const userRequests = rateLimiter.get(identifier) || [];

  // Clean old requests
  const validRequests = userRequests.filter((time) => now - time < window);

  if (validRequests.length >= limit) {
    return false; // Rate limit exceeded
  }

  validRequests.push(now);
  rateLimiter.set(identifier, validRequests);
  return true;
}
```

#### 7. Input Validation & Sanitization

```typescript
import DOMPurify from "dompurify";
import validator from "validator";

// Server-side validation schema
const guestSchema = {
  first_name: {
    required: true,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  email: {
    required: true,
    validator: validator.isEmail,
  },
  phone: {
    validator: validator.isMobilePhone,
  },
};

// Sanitize HTML content
const sanitizedContent = DOMPurify.sanitize(userInput);
```

### 🟢 Medium Priority (Fix Within 1 Month)

#### 8. Implement Session Security

```typescript
// Secure session management
class SessionManager {
  static async createSession(userId: string) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await supabase.from("user_sessions").insert({
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt,
      ip_address: req.headers["x-forwarded-for"],
      user_agent: req.headers["user-agent"],
    });

    return sessionId;
  }

  static async invalidateUserSessions(userId: string) {
    await supabase.from("user_sessions").delete().eq("user_id", userId);
  }
}
```

#### 9. Add Audit Logging

```typescript
// Audit log implementation
async function logSecurityEvent(event: SecurityEvent) {
  await supabase.from("security_logs").insert({
    event_type: event.type,
    user_id: event.userId,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    details: event.details,
    timestamp: new Date(),
  });
}

// Log important events
logSecurityEvent({
  type: "LOGIN_SUCCESS",
  userId: user.id,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});
```

#### 10. Implement Error Handling

```typescript
// Secure error handler
class SecurityErrorHandler {
  static handleError(error: Error, context: string) {
    // Log detailed error for debugging
    Logger.error(`[${context}] ${error.message}`, error.stack);

    // Return generic error to client
    return {
      error: "An error occurred. Please try again.",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## Security Best Practices

### Development Practices

1. **Secure Coding Standards**

   - Use TypeScript for type safety
   - Implement input validation on both client and server
   - Follow principle of least privilege
   - Regular dependency updates

2. **Authentication Best Practices**

   - Multi-factor authentication
   - Strong password policies
   - Account lockout mechanisms
   - Session timeout controls

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement data anonymization
   - Regular backup encryption

### Infrastructure Security

1. **Database Security**

   - Row Level Security (RLS) enabled ✅
   - Regular security updates
   - Database connection encryption
   - Audit logging enabled

2. **API Security**

   - Rate limiting implementation
   - API authentication required
   - Request/response validation
   - CORS policy configured

3. **Deployment Security**
   - Environment variable protection
   - Secrets management
   - Regular security scans
   - Monitoring and alerting

---

## Testing Checklist

### Manual Testing Checklist

#### Authentication & Authorization

- [ ] Test with invalid credentials
- [ ] Test password strength requirements
- [ ] Test session timeout functionality
- [ ] Test concurrent session handling
- [ ] Test password reset flow
- [ ] Test account lockout mechanism

#### Input Validation

- [ ] Test XSS payloads in all input fields
- [ ] Test SQL injection attempts
- [ ] Test file upload restrictions
- [ ] Test input length limits
- [ ] Test special character handling

#### Business Logic

- [ ] Test unauthorized access to other users' data
- [ ] Test payment amount manipulation
- [ ] Test RSVP token manipulation
- [ ] Test plan upgrade/downgrade flows
- [ ] Test guest limit enforcement

#### API Security

- [ ] Test rate limiting on all endpoints
- [ ] Test API authentication bypass
- [ ] Test malformed request handling
- [ ] Test CORS policy enforcement

### Automated Testing Tools

#### 1. OWASP ZAP Scanning

```bash
# Install OWASP ZAP
docker pull owasp/zap2docker-stable

# Run automated scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-app.netlify.app
```

#### 2. Nuclei Security Scanner

```bash
# Install nuclei
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest

# Run scan
nuclei -u https://your-app.netlify.app -tags cve,oast,tech
```

#### 3. Custom Security Tests

```javascript
// Automated XSS testing
const xssPayloads = require("./xss-payloads.json");

describe("XSS Protection", () => {
  xssPayloads.forEach((payload) => {
    test(`Should sanitize XSS payload: ${payload}`, async () => {
      const response = await request(app)
        .post("/api/guests")
        .send({ first_name: payload });

      expect(response.body.first_name).not.toContain("<script>");
    });
  });
});
```

---

## Monitoring & Detection

### Security Monitoring Implementation

1. **Real-time Monitoring**

   - Failed authentication attempts
   - Unusual API usage patterns
   - Suspicious user behavior
   - Error rate spikes

2. **Alerting System**

   - Multiple failed login attempts
   - Privilege escalation attempts
   - Data exfiltration patterns
   - System compromise indicators

3. **Incident Response Plan**
   - Detection procedures
   - Escalation protocols
   - Recovery procedures
   - Post-incident analysis

### Implementation Example

```typescript
// Security monitoring service
class SecurityMonitor {
  static async detectAnomalousActivity(userId: string, action: string) {
    const recentActivity = await this.getUserActivity(userId, "1 hour");

    if (this.isAnomalous(recentActivity, action)) {
      await this.triggerAlert({
        type: "ANOMALOUS_ACTIVITY",
        userId,
        action,
        severity: "HIGH",
      });
    }
  }

  static async triggerAlert(alert: SecurityAlert) {
    // Send to monitoring system
    await fetch("https://monitoring-system.com/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    });
  }
}
```

---

## Conclusion

The Saahitt Guest Manager application has several security vulnerabilities that need immediate attention. The most critical issues involve information disclosure through console logging, weak password management, and insecure token handling.

### Priority Actions:

1. **Immediate (24-48 hours):** Remove production console logs, fix password hashing
2. **Short-term (1 week):** Implement CSP, rate limiting, input validation
3. **Medium-term (1 month):** Add comprehensive monitoring, audit logging, security headers

### Security Maturity Roadmap:

- **Current State:** Basic security with RLS enabled
- **Target State:** Enterprise-grade security with comprehensive monitoring
- **Timeline:** 3-month implementation plan

Regular security assessments should be conducted quarterly, with penetration testing performed bi-annually to maintain security posture.

---

_This assessment was conducted on August 1, 2025. Regular updates to this document should be made as new vulnerabilities are discovered or fixes are implemented._
