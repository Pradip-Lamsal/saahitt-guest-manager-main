
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { useToast } from "@/components/ui/use-toast";

export function useEventData() {
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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch events: " + error.message,
        });
        throw error;
      }
      
      return data || [];
    },
  });

  const addEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...newEvent,
          user_id: user.id
        })
        .select();

      if (error) {
        console.error("Error adding event:", error);
        throw error;
      }
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event added successfully",
      });
    },
    onError: (error: any) => {
      console.error("Add event mutation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add event: " + (error.message || "Unknown error"),
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async (event: Event) => {
      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          description: event.description,
          date: event.date,
        })
        .eq('id', event.id);

      if (error) {
        console.error("Error updating event:", error);
        throw error;
      }
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Update event mutation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event: " + (error.message || "Unknown error"),
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Delete event mutation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event: " + (error.message || "Unknown error"),
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    refetch,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
