
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvites } from "@/hooks/useInvites";
import { Mail, AlertCircle } from "lucide-react";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  guestIds: string[];
  guestCount: number;
}

const InviteDialog = ({ open, onOpenChange, eventId, guestIds, guestCount }: InviteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendInvites } = useInvites();
  const { toast } = useToast();

  const handleSendInvites = async () => {
    if (guestIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No guests selected",
        description: "Please select at least one guest to send invites.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await sendInvites.mutateAsync({ guestIds, eventId });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Invitations</DialogTitle>
          <DialogDescription>
            Email invitations will be sent to the selected guests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <Mail className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h4 className="font-medium">Confirm sending invites</h4>
            <p className="text-sm text-gray-500">
              Send invitations to {guestCount} {guestCount === 1 ? "guest" : "guests"}
            </p>
          </div>
        </div>

        {guestIds.some(id => !id) && (
          <div className="flex items-start space-x-2 text-sm bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800">
                Some selected guests may not have email addresses and won't receive invitations.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendInvites}
            disabled={isSubmitting}
            className="bg-[#FF6F00] hover:bg-[#FF6F00]/90"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Sending...
              </>
            ) : (
              "Send Invites"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
