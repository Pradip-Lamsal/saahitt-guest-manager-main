import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const SESSION_WARNING_TIME = 10 * 60 * 1000; // 10 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearUserData = useCallback(() => {
    setUser(null);
    setSession(null);
    setSessionWarningShown(false);
    queryClient.clear();
  }, [queryClient]);

  const handleSessionExpiry = useCallback(async () => {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });
    
    await supabase.auth.signOut();
    clearUserData();
    window.location.href = '/auth';
  }, [toast, clearUserData]);

  const showSessionWarning = useCallback(() => {
    if (!sessionWarningShown) {
      setSessionWarningShown(true);
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire in 10 minutes. Please save your work.",
        variant: "destructive",
      });
    }
  }, [sessionWarningShown, toast]);

  const checkSessionExpiry = useCallback(() => {
    if (!session) return;

    const now = Date.now() / 1000;
    const expiresAt = session.expires_at;
    
    if (!expiresAt) return;

    const timeUntilExpiry = (expiresAt - now) * 1000;

    if (timeUntilExpiry <= 0) {
      handleSessionExpiry();
    } else if (timeUntilExpiry <= SESSION_WARNING_TIME) {
      showSessionWarning();
    }
  }, [session, handleSessionExpiry, showSessionWarning]);

  const refreshUserProfile = useCallback(async () => {
    if (!user) return;
    
    // Invalidate all user-related queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['planConfigurations'] });
  }, [user, queryClient]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearUserData();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "There was an issue signing you out.",
        variant: "destructive",
      });
    }
  }, [clearUserData, toast]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setSessionWarningShown(false);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Refresh user profile data when signed in or token refreshed
          setTimeout(() => {
            refreshUserProfile();
          }, 100);
        }

        if (event === 'SIGNED_OUT') {
          clearUserData();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearUserData, refreshUserProfile]);

  useEffect(() => {
    // Set up session expiry checking
    const interval = setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkSessionExpiry]);

  return {
    user,
    session,
    loading,
    signOut,
    refreshUserProfile,
    isAuthenticated: !!user,
  };
}