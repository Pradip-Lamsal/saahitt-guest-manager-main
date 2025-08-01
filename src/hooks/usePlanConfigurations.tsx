
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlanConfiguration {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  guest_limit: number;
  features: string[];
  is_active: boolean;
}

export function usePlanConfigurations() {
  const { 
    data: planConfigurations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['planConfigurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Error fetching plan configurations:", error);
        throw error;
      }
      
      return (data || []).map((plan): PlanConfiguration => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features 
          : typeof plan.features === 'string' 
            ? JSON.parse(plan.features)
            : plan.features ? (Object.values(plan.features) as string[]) : [],
      }));
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const getPlanById = (planId: string): PlanConfiguration => {
    const plan = planConfigurations.find(plan => plan.plan_id === planId);
    
    // Return default plan if not found
    if (!plan) {
      return {
        id: 0,
        plan_id: 'free',
        name: 'Free Plan',
        description: 'Basic features with limited guests',
        price: 0,
        guest_limit: 100,
        features: ["Basic sorting", "Export & print guest list", "Minimalist UI"],
        is_active: true
      };
    }
    
    return plan;
  };

  return {
    planConfigurations,
    isLoading,
    error,
    refetch,
    getPlanById
  };
}
