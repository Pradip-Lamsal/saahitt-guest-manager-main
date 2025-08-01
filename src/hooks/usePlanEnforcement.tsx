import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPlanById } from "@/lib/plans";
import { useToast } from "@/hooks/use-toast";

interface PlanLimits {
  guestLimit: number;
  hasAdvancedFeatures: boolean;
  hasAIFeatures: boolean;
  hasCustomFields: boolean;
  hasBulkImport: boolean;
  hasAdvancedExport: boolean;
}

export function usePlanEnforcement() {
  const { toast } = useToast();
  const [currentUsage, setCurrentUsage] = useState({ guests: 0 });

  // Get current user plan
  const {
    data: userProfile,
    isLoading,
    error,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 0, // Always refetch to ensure latest plan data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Get current guest count
  const { data: guestCount = 0 } = useQuery({
    queryKey: ['guestCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Calculate plan limits based on current plan
  const planLimits: PlanLimits = (() => {
    const planType = userProfile?.plan_type || 'free';
    const plan = getPlanById(planType);

    switch (planType) {
      case 'pro':
        return {
          guestLimit: 500,
          hasAdvancedFeatures: true,
          hasAIFeatures: false,
          hasCustomFields: true,
          hasBulkImport: true,
          hasAdvancedExport: true,
        };
      case 'ultimate':
        return {
          guestLimit: 2000,
          hasAdvancedFeatures: true,
          hasAIFeatures: true,
          hasCustomFields: true,
          hasBulkImport: true,
          hasAdvancedExport: true,
        };
      default:
        return {
          guestLimit: 100,
          hasAdvancedFeatures: false,
          hasAIFeatures: false,
          hasCustomFields: false,
          hasBulkImport: false,
          hasAdvancedExport: false,
        };
    }
  })();

  // Update current usage
  useEffect(() => {
    setCurrentUsage({ guests: guestCount });
  }, [guestCount]);

  // Check if user can add more guests
  const canAddGuest = () => {
    return currentUsage.guests < planLimits.guestLimit;
  };

  // Check if user has reached limit and show upgrade prompt
  const checkGuestLimit = () => {
    if (currentUsage.guests >= planLimits.guestLimit) {
      toast({
        title: "Guest Limit Reached",
        description: `You've reached your plan's limit of ${planLimits.guestLimit} guests. Upgrade to add more.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Check if feature is available
  const hasFeature = (feature: keyof Omit<PlanLimits, 'guestLimit'>) => {
    return planLimits[feature];
  };

  // Show upgrade prompt for locked features
  const showUpgradePrompt = (featureName: string) => {
    toast({
      title: "Premium Feature",
      description: `${featureName} is available on paid plans. Upgrade to unlock this feature.`,
      variant: "destructive",
    });
  };

  return {
    planLimits,
    currentUsage,
    userPlan: userProfile?.plan_type || 'free',
    isLoading,
    error,
    canAddGuest,
    checkGuestLimit,
    hasFeature,
    showUpgradePrompt,
    refetchProfile,
  };
}