
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EventGuest } from "@/types/event";
import { Guest, RsvpStatus } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapStatusToRsvp } from "@/utils/rsvpMapper";

export const useEventGuests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch guests",
        });
        throw error;
      }
      
      return data?.map(guest => ({
        ...guest,
        priority: guest.priority as 'High' | 'Medium' | 'Low',
        status: guest.status as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending',
        rsvp_status: (guest.rsvp_status as RsvpStatus) || mapStatusToRsvp(guest.status as Guest['status']),
        custom_values: guest.custom_values && typeof guest.custom_values === 'object' && !Array.isArray(guest.custom_values) ? guest.custom_values as Record<string, any> : {},
        rsvp_details: guest.rsvp_details && typeof guest.rsvp_details === 'object' && !Array.isArray(guest.rsvp_details) ? guest.rsvp_details as Record<string, any> : null,
      })) || [];
    }
  });

  const { data: eventGuests = {} } = useQuery({
    queryKey: ['eventGuests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_guests")
        .select("*");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch event guests",
        });
        throw error;
      }

      const guestsByEvent: Record<string, EventGuest[]> = {};
      (data || []).forEach((eg: EventGuest) => {
        if (!guestsByEvent[eg.event_id]) {
          guestsByEvent[eg.event_id] = [];
        }
        guestsByEvent[eg.event_id].push(eg);
      });
      
      return guestsByEvent;
    }
  });

  const toggleGuestMutation = useMutation({
    mutationFn: async ({ eventId, guestId, isCurrentlySelected }: { 
      eventId: string; 
      guestId: string; 
      isCurrentlySelected: boolean 
    }) => {
      if (isCurrentlySelected) {
        const { error } = await supabase
          .from("event_guests")
          .delete()
          .eq("event_id", eventId)
          .eq("guest_id", guestId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_guests")
          .insert({ event_id: eventId, guest_id: guestId });

        if (error) throw error;
      }
      
      return { eventId, guestId, isCurrentlySelected };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventGuests'] });
      toast({
        title: "Success",
        description: `Guest ${variables.isCurrentlySelected ? "removed from" : "added to"} event`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event guests",
      });
    }
  });

  const bulkToggleGuestsMutation = useMutation({
    mutationFn: async ({ 
      eventId, 
      guestIds, 
      add 
    }: { 
      eventId: string; 
      guestIds: string[]; 
      add: boolean 
    }) => {
      if (add) {
        const newEventGuests = guestIds.map(guestId => ({
          event_id: eventId,
          guest_id: guestId
        }));

        const { error } = await supabase
          .from("event_guests")
          .insert(newEventGuests);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_guests")
          .delete()
          .eq("event_id", eventId)
          .in("guest_id", guestIds);

        if (error) throw error;
      }
      
      return { eventId, guestIds, add };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventGuests'] });
      toast({
        title: "Success",
        description: `${variables.guestIds.length} guests ${variables.add ? "added to" : "removed from"} event`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event guests",
      });
    }
  });

  const updateInviteStatusMutation = useMutation({
    mutationFn: async ({ 
      eventId, 
      guestId, 
      details 
    }: { 
      eventId: string; 
      guestId: string; 
      details: {
        invite_sent: boolean;
        invite_method?: string;
        invite_notes?: string;
      }
    }) => {
      const { error } = await supabase
        .from("event_guests")
        .update({
          ...details,
          invite_sent_at: details.invite_sent ? new Date().toISOString() : null
        })
        .eq("event_id", eventId)
        .eq("guest_id", guestId);

      if (error) throw error;
      
      return { eventId, guestId, details };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventGuests'] });
      toast({
        title: "Success",
        description: "Invite status updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invite status",
      });
    }
  });

  const handleGuestToggle = (eventId: string, guestId: string) => {
    const isCurrentlySelected = eventGuests[eventId]?.some(eg => eg.guest_id === guestId);
    toggleGuestMutation.mutate({ eventId, guestId, isCurrentlySelected });
  };

  const handleBulkGuestToggle = (eventId: string, guestIds: string[], add: boolean) => {
    bulkToggleGuestsMutation.mutate({ eventId, guestIds, add });
  };

  const updateInviteStatus = (
    eventId: string, 
    guestId: string, 
    details: {
      invite_sent: boolean;
      invite_method?: string;
      invite_notes?: string;
    }
  ) => {
    updateInviteStatusMutation.mutate({ eventId, guestId, details });
  };

  return {
    guests,
    eventGuests,
    fetchGuests: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
    fetchEventGuests: () => queryClient.invalidateQueries({ queryKey: ['eventGuests'] }),
    handleGuestToggle,
    handleBulkGuestToggle,
    updateInviteStatus,
  };
};
