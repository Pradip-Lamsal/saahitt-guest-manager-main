
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: events = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch events",
        });
        throw error;
      }
      
      return data || [];
    },
  });

  const handleEventUpdate = useMutation({
    mutationFn: async (event: Event) => {
      const { error } = await supabase
        .from("events")
        .update({
          name: event.name,
          description: event.description,
          date: event.date,
        })
        .eq("id", event.id);

      if (error) throw error;
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
    }
  });

  const handleEventDelete = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  });

  return {
    events,
    isLoading,
    fetchEvents: refetch,
    handleEventUpdate: (event: Event) => handleEventUpdate.mutate(event),
    handleEventDelete: (eventId: string) => handleEventDelete.mutate(eventId),
  };
};
