/**
 * Security Monitor Component
 * Displays security status and alerts for the application
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SessionManager from "@/utils/sessionManager";
import {
  AlertTriangle,
  Eye,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface SecurityStatus {
  httpsEnabled: boolean;
  sessionValid: boolean;
  networkOnline: boolean;
  lastActivity: number;
  securityHeaders: boolean;
  suspiciousActivity: boolean;
}

interface SecurityAlert {
  id: string;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

export const SecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    httpsEnabled: window.location.protocol === "https:",
    sessionValid: true,
    networkOnline: navigator.onLine,
    lastActivity: Date.now(),
    securityHeaders: false,
    suspiciousActivity: false,
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const { toast } = useToast();

  // Check security headers
  const checkSecurityHeaders = async (): Promise<boolean> => {
    try {
      const response = await fetch(window.location.origin, { method: "HEAD" });
      const requiredHeaders = [
        "x-frame-options",
        "x-content-type-options",
        "x-xss-protection",
      ];

      const hasHeaders = requiredHeaders.every((header) =>
        response.headers.get(header)
      );

      return hasHeaders;
    } catch {
      return false;
    }
  };

  // Add security alert
  const addAlert = React.useCallback(
    (alert: Omit<SecurityAlert, "id" | "timestamp">) => {
      const newAlert: SecurityAlert = {
        ...alert,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]); // Keep only last 5 alerts

      // Show toast for critical alerts
      if (alert.type === "error") {
        toast({
          title: alert.title,
          description: alert.message,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Remove alert
  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Monitor security status
  useEffect(() => {
    const checkStatus = async () => {
      const sessionInfo = SessionManager.getSessionInfo();
      const securityHeaders = await checkSecurityHeaders();

      setSecurityStatus((prev) => ({
        ...prev,
        sessionValid: sessionInfo.isValid,
        networkOnline: navigator.onLine,
        lastActivity: Date.now(),
        securityHeaders,
      }));

      // Check for security issues
      if (!securityHeaders && window.location.protocol === "https:") {
        addAlert({
          type: "warning",
          title: "Missing Security Headers",
          message: "Some security headers are not configured properly.",
        });
      }

      if (!sessionInfo.isValid) {
        addAlert({
          type: "error",
          title: "Session Invalid",
          message: "Your session has become invalid. Please sign in again.",
          actions: [
            {
              label: "Sign In",
              handler: () => (window.location.href = "/auth"),
            },
          ],
        });
      }

      if (sessionInfo.shouldShowWarning) {
        addAlert({
          type: "warning",
          title: "Session Expiring Soon",
          message: "Your session will expire in 10 minutes.",
          actions: [
            {
              label: "Extend Session",
              handler: () => {
                SessionManager.updateActivity();
                toast({
                  title: "Session Extended",
                  description: "Your session has been extended.",
                });
              },
            },
          ],
        });
      }
    };

    // Initial check
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [toast, addAlert]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setSecurityStatus((prev) => ({ ...prev, networkOnline: true }));
      addAlert({
        type: "info",
        title: "Connection Restored",
        message: "Network connection has been restored.",
      });
    };

    const handleOffline = () => {
      setSecurityStatus((prev) => ({ ...prev, networkOnline: false }));
      addAlert({
        type: "warning",
        title: "Connection Lost",
        message:
          "Network connection has been lost. Some features may not work.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addAlert]);

  // Listen for suspicious activity
  useEffect(() => {
    const handleSuspiciousActivity = () => {
      setSecurityStatus((prev) => ({ ...prev, suspiciousActivity: true }));
      addAlert({
        type: "error",
        title: "Suspicious Activity Detected",
        message:
          "Unusual activity has been detected. Please verify your identity.",
        actions: [
          {
            label: "Sign Out",
            handler: () => {
              SessionManager.clearSession();
              window.location.href = "/auth";
            },
          },
        ],
      });
    };

    window.addEventListener("suspiciousActivity", handleSuspiciousActivity);

    return () => {
      window.removeEventListener(
        "suspiciousActivity",
        handleSuspiciousActivity
      );
    };
  }, [addAlert]);

  // Calculate overall security score
  const getSecurityScore = (): {
    score: number;
    level: string;
    color: string;
  } => {
    let score = 0;

    if (securityStatus.httpsEnabled) score += 25;
    if (securityStatus.sessionValid) score += 25;
    if (securityStatus.networkOnline) score += 15;
    if (securityStatus.securityHeaders) score += 20;
    if (!securityStatus.suspiciousActivity) score += 15;

    let level = "Poor";
    let color = "text-red-500";

    if (score >= 80) {
      level = "Excellent";
      color = "text-green-500";
    } else if (score >= 60) {
      level = "Good";
      color = "text-yellow-500";
    } else if (score >= 40) {
      level = "Fair";
      color = "text-orange-500";
    }

    return { score, level, color };
  };

  const securityScore = getSecurityScore();

  // Only show in development or when there are alerts
  if (import.meta.env.PROD && alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader
          className="pb-2 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {securityScore.score >= 80 ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : securityScore.score >= 60 ? (
                <Shield className="h-5 w-5 text-yellow-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-sm">Security Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={securityScore.color}>
                {securityScore.score}%
              </Badge>
              <Button variant="ghost" size="sm">
                {isMinimized ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-0">
            {/* Security Status */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span>HTTPS</span>
                {securityStatus.httpsEnabled ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Session</span>
                {securityStatus.sessionValid ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Network</span>
                {securityStatus.networkOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Headers</span>
                {securityStatus.securityHeaders ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>

            {/* Security Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium">Recent Alerts</h4>
                {alerts.slice(0, 3).map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={alert.type === "error" ? "destructive" : "default"}
                    className="text-xs"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <AlertTitle className="text-xs">{alert.title}</AlertTitle>
                    <AlertDescription className="text-xs">
                      {alert.message}
                      {alert.actions && (
                        <div className="mt-2 space-x-2">
                          {alert.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                action.handler();
                                removeAlert(alert.id);
                              }}
                              className="text-xs h-6"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SecurityMonitor;
