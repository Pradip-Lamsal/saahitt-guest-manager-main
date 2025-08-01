
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Guest, NewGuest, RsvpStatus } from "@/types/guest";
import { useToast } from "@/components/ui/use-toast";
import { usePlanConfigurations } from "./usePlanConfigurations";
import { mapStatusToRsvp } from "@/utils/rsvpMapper";

export function useGuestData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getPlanById } = usePlanConfigurations();

  const { 
    data: guests = [], 
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch guests",
        });
        throw error;
      }
      
      return (data || []).map((guest): Guest => ({
        ...guest,
        priority: guest.priority as Guest['priority'],
        status: guest.status as Guest['status'],
        rsvp_status: (guest.rsvp_status as RsvpStatus) || mapStatusToRsvp(guest.status as Guest['status']),
        custom_values: guest.custom_values && typeof guest.custom_values === 'object' && !Array.isArray(guest.custom_values) ? guest.custom_values as Record<string, any> : {},
        rsvp_details: guest.rsvp_details && typeof guest.rsvp_details === 'object' && !Array.isArray(guest.rsvp_details) ? guest.rsvp_details as Record<string, any> : null,
      }));
    },
    staleTime: 1000, // Set a shorter stale time to refresh data more frequently
  });

  const getGuestById = async (id: string): Promise<Guest> => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch guest details",
      });
      throw error;
    }

    return {
      ...data,
      priority: data.priority as Guest['priority'],
      status: data.status as Guest['status'],
      rsvp_status: (data.rsvp_status as RsvpStatus) || mapStatusToRsvp(data.status as Guest['status']),
      custom_values: data.custom_values && typeof data.custom_values === 'object' && !Array.isArray(data.custom_values) ? data.custom_values as Record<string, any> : {},
      rsvp_details: data.rsvp_details && typeof data.rsvp_details === 'object' && !Array.isArray(data.rsvp_details) ? data.rsvp_details as Record<string, any> : null,
    };
  };

  const addGuests = useMutation({
    mutationFn: async (newGuests: NewGuest[]) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("User not authenticated");
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', session.user.id)
          .single();
            
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          const defaultPlanType = 'free';
          
          const defaultPlanConfig = getPlanById(defaultPlanType);
          
          const { count, error: countError } = await supabase
            .from('guests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
              
          if (countError) throw countError;
            
          const currentCount = count || 0;
          const totalAfterAdd = currentCount + newGuests.length;
            
          if (totalAfterAdd > defaultPlanConfig.guest_limit) {
            throw new Error(`Free plan is limited to ${defaultPlanConfig.guest_limit} guests. You currently have ${currentCount} guests. Please upgrade to add more.`);
          }
        } else {
          const planType = profileData.plan_type;
          const planConfig = getPlanById(planType);
          
          const { count, error: countError } = await supabase
            .from('guests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
              
          if (countError) throw countError;
            
          const currentCount = count || 0;
          const totalAfterAdd = currentCount + newGuests.length;
            
          if (totalAfterAdd > planConfig.guest_limit) {
            throw new Error(`Your ${planConfig.name} is limited to ${planConfig.guest_limit} guests. You currently have ${currentCount} guests. Please upgrade to add more.`);
          }
        }
        
        const guestsWithUserId = newGuests.map(guest => ({
          ...guest,
          user_id: session.user.id,
          custom_values: guest.custom_values || {},
        }));
        
        const { error } = await supabase
          .from('guests')
          .insert(guestsWithUserId);
          
        if (error) throw error;
        
        return guestsWithUserId;
      } catch (error: any) {
        console.error("Error adding guests:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Success",
        description: "Guests added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add guests",
      });
    },
  });

  const updateGuest = useMutation({
    mutationFn: async (guest: Guest) => {
      const updatedGuest = {
        ...guest,
        custom_values: guest.custom_values || {}
      };
      
      const { error } = await supabase
        .from('guests')
        .update(updatedGuest)
        .eq('id', guest.id);

      if (error) throw error;
      return updatedGuest;
    },
    onSuccess: (updatedGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', updatedGuest.id] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update guest",
      });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', id] });
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete guest",
      });
    },
  });

  const getGuestStatsByCategory = () => {
    const categoryStats: Record<string, number> = {};
    
    guests.forEach(guest => {
      const category = guest.category || 'Others';
      if (categoryStats[category]) {
        categoryStats[category]++;
      } else {
        categoryStats[category] = 1;
      }
    });
    
    return categoryStats;
  };

  const getGuestStatsByCustomField = (fieldName: string) => {
    const valueStats: Record<string, number> = {};
    
    guests.forEach(guest => {
      const value = String(guest.custom_values?.[fieldName] || 'Not Set');
      if (valueStats[value]) {
        valueStats[value]++;
      } else {
        valueStats[value] = 1;
      }
    });
    
    return valueStats;
  };

  return {
    guests,
    isLoading,
    isFetching,
    error,
    refetch,
    getGuestById,
    addGuests,
    updateGuest,
    deleteGuest,
    getGuestStatsByCategory,
    getGuestStatsByCustomField,
  };
}
