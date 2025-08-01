import React from "react";
import { Progress } from "./progress";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "@/lib/passwordValidation";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showFeedback?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  className,
  showFeedback = true 
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = validatePassword(password);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength</span>
        <span 
          className="text-sm font-medium"
          style={{ color: getPasswordStrengthColor(strength.level) }}
        >
          {getPasswordStrengthText(strength.level)}
        </span>
      </div>
      
      <Progress 
        value={strength.score} 
        className="h-2"
        style={{
          '--progress-background': getPasswordStrengthColor(strength.level)
        } as React.CSSProperties}
      />

      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {feedback}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}