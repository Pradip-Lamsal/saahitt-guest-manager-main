
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import GuestListPDF from "./GuestListPDF";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  event?: Event;
  eventGuests?: EventGuest[];
}

const PDFPreviewDialog = ({ open, onOpenChange, guests, event, eventGuests }: PDFPreviewDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const handleDownload = async () => {
    try {
      setLoading(true);
      // Create filename with current date
      const date = new Date().toISOString().split("T")[0];
      const filename = `guest-list-${date}.pdf`;
      
      // Use FileSaver to download the PDF
      // This is handled by the PDFDownloadLink component
      
      setLoading(false);
      toast({
        title: "Download Started",
        description: "Your guest list PDF is being downloaded",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Please try again later",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Guest List Preview</DialogTitle>
        </DialogHeader>
        
        {guests.length > 0 ? (
          <div className="space-y-4">
            <div className="border rounded-md bg-gray-50 overflow-auto" style={{ height: isMobile ? "300px" : "500px" }}>
              <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
                <GuestListPDF 
                  guests={guests} 
                  event={event}
                  eventGuests={eventGuests || []}
                />
              </PDFViewer>
            </div>
            
            <div className="flex justify-end">
              <PDFDownloadLink
                document={
                  <GuestListPDF 
                    guests={guests} 
                    event={event}
                    eventGuests={eventGuests || []}
                  />
                }
                fileName={`guest-list-${new Date().toISOString().split('T')[0]}.pdf`}
                className="inline-block"
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    {loading ? "Preparing Download..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p>No guests to display in the PDF.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
