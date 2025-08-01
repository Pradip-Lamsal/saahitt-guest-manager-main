interface PasswordPolicy {
  min_length: number;
  max_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history_count: number;
  password_expiry_days: number;
}

interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
}

const DEFAULT_POLICY: PasswordPolicy = {
  min_length: 8,
  max_length: 128,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_special_chars: true,
  password_history_count: 5,
  password_expiry_days: 90,
};

// Common weak passwords to check against
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', 'welcome123', 'admin123', '12345678', '87654321',
]);

export function validatePassword(password: string, policy: PasswordPolicy = DEFAULT_POLICY): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < policy.min_length) {
    feedback.push(`Password must be at least ${policy.min_length} characters long`);
  } else if (password.length >= policy.min_length) {
    score += 20;
  }

  if (password.length > policy.max_length) {
    feedback.push(`Password must not exceed ${policy.max_length} characters`);
  }

  // Character requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (policy.require_uppercase && !hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (hasUppercase) {
    score += 15;
  }

  if (policy.require_lowercase && !hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (hasLowercase) {
    score += 15;
  }

  if (policy.require_numbers && !hasNumbers) {
    feedback.push('Password must contain at least one number');
  } else if (hasNumbers) {
    score += 15;
  }

  if (policy.require_special_chars && !hasSpecialChars) {
    feedback.push('Password must contain at least one special character');
  } else if (hasSpecialChars) {
    score += 15;
  }

  // Complexity bonuses
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Pattern diversity
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 10;

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    feedback.push('This password is too common. Please choose a different one.');
    score = Math.min(score, 20);
  }

  // Check for repeated characters
  const repeatedPattern = /(.)\1{2,}/;
  if (repeatedPattern.test(password)) {
    feedback.push('Avoid repeating the same character more than twice');
    score -= 10;
  }

  // Check for sequential patterns
  const sequentialNumbers = /(?:0123|1234|2345|3456|4567|5678|6789|7890)/;
  const sequentialLetters = /(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i;
  
  if (sequentialNumbers.test(password) || sequentialLetters.test(password)) {
    feedback.push('Avoid using sequential characters');
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else level = 'strong';

  const isValid = feedback.length === 0 && score >= 60;

  return {
    score,
    level,
    feedback,
    isValid,
  };
}

export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one character from each required category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize positions
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function getPasswordStrengthColor(level: string): string {
  switch (level) {
    case 'weak': return 'hsl(var(--destructive))';
    case 'fair': return 'hsl(var(--warning))';
    case 'good': return 'hsl(var(--success))';
    case 'strong': return 'hsl(var(--primary))';
    default: return 'hsl(var(--muted))';
  }
}

export function getPasswordStrengthText(level: string): string {
  switch (level) {
    case 'weak': return 'Weak';
    case 'fair': return 'Fair';
    case 'good': return 'Good';
    case 'strong': return 'Strong';
    default: return 'Unknown';
  }
}