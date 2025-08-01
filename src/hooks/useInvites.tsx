
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendInviteProps {
  guestIds: string[];
  eventId: string;
}

interface InviteResult {
  success: string[];
  failed: { guestId: string; error: string }[];
}

export function useInvites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to send invites
  const sendInvites = useMutation({
    mutationFn: async ({ guestIds, eventId }: SendInviteProps): Promise<InviteResult> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("User not authenticated");
        }

        // Call the send-invite edge function
        const { data, error } = await supabase.functions.invoke("send-invite", {
          body: {
            guestIds,
            eventId,
            baseUrl: `${window.location.origin}/rsvp`
          }
        });

        if (error) throw error;
        return data as InviteResult;
      } catch (error: any) {
        console.error("Error sending invites:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['eventGuests'] });

      const successCount = data.success.length;
      const failedCount = data.failed.length;

      if (successCount > 0 && failedCount === 0) {
        toast({
          title: "Success",
          description: `Successfully sent ${successCount} invitation${successCount !== 1 ? 's' : ''}.`,
        });
      } else if (successCount > 0 && failedCount > 0) {
        toast({
          variant: "default",
          title: "Partial Success",
          description: `Sent ${successCount} invitation${successCount !== 1 ? 's' : ''}, but ${failedCount} failed. Check guest emails.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed",
          description: `Failed to send invitations. Please try again.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitations",
      });
    },
  });

  return {
    sendInvites,
  };
}
