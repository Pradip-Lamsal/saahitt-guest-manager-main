import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanStateContextType {
  currentPlan: string;
  refreshPlanData: () => void;
  updatePlanLocally: (newPlan: string) => void;
}

const PlanStateContext = createContext<PlanStateContextType | null>(null);

export function PlanStateProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshPlanData = () => {
    // Invalidate all plan-related queries
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['guestCount'] });
    queryClient.invalidateQueries({ queryKey: ['planConfigurations'] });
  };

  const updatePlanLocally = (newPlan: string) => {
    setCurrentPlan(newPlan);
    refreshPlanData();
    
    toast({
      title: "Plan Updated",
      description: `Your plan has been updated to ${newPlan}. All features are now available.`,
    });
  };

  useEffect(() => {
    // Listen for real-time updates to user profile
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`
        },
        (payload) => {
          if (payload.new?.plan_type && payload.new.plan_type !== currentPlan) {
            setCurrentPlan(payload.new.plan_type);
            refreshPlanData();
            
            toast({
              title: "Plan Updated",
              description: `Your plan has been updated to ${payload.new.plan_type}.`,
            });
          }
        }
      )
      .subscribe();

    // Listen for subscription changes
    const subscriptionChannel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        () => {
          refreshPlanData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(subscriptionChannel);
    };
  }, [currentPlan, queryClient, toast]);

  return (
    <PlanStateContext.Provider value={{ currentPlan, refreshPlanData, updatePlanLocally }}>
      {children}
    </PlanStateContext.Provider>
  );
}

export function useGlobalPlanState() {
  const context = useContext(PlanStateContext);
  if (!context) {
    throw new Error('useGlobalPlanState must be used within a PlanStateProvider');
  }
  return context;
}