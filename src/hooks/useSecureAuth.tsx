/**
 * Secure Authentication Hook
 * Enhanced version of useAuthSession with better security
 */

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SecureLogger from "@/utils/logger";
import SessionManager from "@/utils/sessionManager";
import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearUserData = useCallback(() => {
    setUser(null);
    setSession(null);
    setSessionWarning(false);
    queryClient.clear();
    SessionManager.clearSession();
  }, [queryClient]);

  const handleSessionExpiry = useCallback(async () => {
    SecureLogger.logAuthEvent("Session expired");

    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });

    await supabase.auth.signOut();
    clearUserData();

    // Redirect to auth page
    window.location.href = "/auth";
  }, [toast, clearUserData]);

  const showSessionWarning = useCallback(() => {
    if (!sessionWarning) {
      setSessionWarning(true);
      toast({
        title: "Session Expiring Soon",
        description:
          "Your session will expire in 10 minutes. Please save your work.",
        variant: "destructive",
      });
    }
  }, [sessionWarning, toast]);

  const refreshUserProfile = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (currentSession?.user) {
        // Refresh user data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          SessionManager.updateActivity();
        }
      }
    } catch (error) {
      SecureLogger.error("Error refreshing user profile:", error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      SecureLogger.logAuthEvent("User initiated sign out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearUserData();
    } catch (error) {
      SecureLogger.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing out. Please try again.",
      });
    }
  }, [clearUserData, toast]);

  // Set up auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      SecureLogger.logAuthEvent("Auth state changed", {
        event,
        hasSession: !!session,
      });

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setSessionWarning(false);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          // Initialize secure session management
          SessionManager.initializeSession(
            session.user.id,
            session.user.email || ""
          );

          // Refresh user profile data when signed in or token refreshed
          setTimeout(() => {
            refreshUserProfile();
          }, 100);
        }
      }

      if (event === "SIGNED_OUT") {
        clearUserData();
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        SessionManager.initializeSession(
          session.user.id,
          session.user.email || ""
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearUserData, refreshUserProfile]);

  // Set up session monitoring
  useEffect(() => {
    // Set up activity listeners
    SessionManager.setupActivityListeners();

    // Listen for session expiry events
    const handleSessionExpired = () => {
      handleSessionExpiry();
    };

    const handleSuspiciousActivity = () => {
      SecureLogger.logAuthEvent("Suspicious activity detected");
      toast({
        title: "Unusual Activity Detected",
        description:
          "We've detected unusual activity on your account. Please verify your identity.",
        variant: "destructive",
      });
    };

    window.addEventListener("sessionExpired", handleSessionExpired);
    window.addEventListener("suspiciousActivity", handleSuspiciousActivity);

    // Session status check interval
    const sessionCheckInterval = setInterval(() => {
      const sessionInfo = SessionManager.getSessionInfo();

      if (!sessionInfo.isValid) {
        handleSessionExpiry();
      } else if (sessionInfo.shouldShowWarning) {
        showSessionWarning();
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
      window.removeEventListener(
        "suspiciousActivity",
        handleSuspiciousActivity
      );
      clearInterval(sessionCheckInterval);
      SessionManager.cleanup();
    };
  }, [handleSessionExpiry, showSessionWarning, toast]);

  // Network connectivity monitoring
  useEffect(() => {
    const handleOnline = () => {
      SecureLogger.logAuthEvent("Network connection restored");
      // Refresh session when coming back online
      if (user) {
        refreshUserProfile();
      }
    };

    const handleOffline = () => {
      SecureLogger.logAuthEvent("Network connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, refreshUserProfile]);

  // Security headers validation (client-side check)
  const validateSecurityHeaders = useCallback(async () => {
    try {
      const response = await fetch(window.location.origin, { method: "HEAD" });
      const securityHeaders = [
        "x-frame-options",
        "x-content-type-options",
        "x-xss-protection",
        "content-security-policy",
      ];

      const missingHeaders = securityHeaders.filter(
        (header) => !response.headers.get(header)
      );

      if (missingHeaders.length > 0) {
        SecureLogger.warn(
          "Missing security headers:",
          missingHeaders.join(", ")
        );
      }
    } catch (error) {
      SecureLogger.error("Error checking security headers:", error);
    }
  }, []);

  // Validate security on mount
  useEffect(() => {
    validateSecurityHeaders();
  }, [validateSecurityHeaders]);

  return {
    user,
    session,
    loading,
    sessionWarning,
    signOut,
    refreshUserProfile,
    isAuthenticated: !!user,
    sessionInfo: user ? SessionManager.getSessionInfo() : null,
  };
}
