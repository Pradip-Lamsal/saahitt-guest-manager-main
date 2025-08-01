
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { NewEvent } from "@/types/event";
import { useEventData } from "@/hooks/useEventData";
import { supabase } from "@/integrations/supabase/client";

interface AddEventFormProps {
  onSuccess: () => void;
}

const AddEventForm = ({ onSuccess }: AddEventFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const { toast } = useToast();
  const { addEvent } = useEventData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to add events",
        });
        setLoading(false);
        return;
      }

      const newEvent: NewEvent = {
        name,
        description,
        date,
        user_id: user.id,
      };

      await addEvent.mutateAsync(newEvent);
      
      // Reset form
      setName("");
      setDescription("");
      setDate("");
      
      // Close dialog and refresh events list
      onSuccess();
    } catch (error: any) {
      console.error("Add event error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add event: " + (error.message || "Unknown error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter event name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Event Date</Label>
        <Input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description (optional)"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add Event"}
      </Button>
    </form>
  );
};

export default AddEventForm;
