import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NewGuest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { mapStatusToRsvp } from "@/utils/rsvpMapper";

interface AddGuestFormProps {
  onSuccess: () => void;
}

const AddGuestForm = ({ onSuccess }: AddGuestFormProps) => {
  const [guests, setGuests] = useState<Partial<NewGuest>[]>([{
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    category: "Others",
    priority: "Medium",
    status: "Pending",
    notes: "",
    custom_values: {},
  }]);
  
  const { toast } = useToast();
  const { addGuests } = useGuestData();
  const { categories } = useCategories();
  
  const { data: customFields = [] } = useQuery({
    queryKey: ["customFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch custom fields",
        });
        throw error;
      }

      return (
        data?.map((field) => ({
          ...field,
          field_type: field.field_type as CustomField["field_type"],
          options: (field.options as string[]) || [],
        })) || []
      );
    },
  });

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value,
    };
    setGuests(updatedGuests);
  };

  const handleCustomValueChange = (index: number, field: string, value: string) => {
    const updatedGuests = [...guests];
    const guestToUpdate = updatedGuests[index];
    
    const customValues = typeof guestToUpdate.custom_values === 'object' && guestToUpdate.custom_values !== null
      ? guestToUpdate.custom_values
      : {};
    
    updatedGuests[index] = {
      ...guestToUpdate,
      custom_values: {
        ...customValues,
        [field]: value,
      },
    };
    
    setGuests(updatedGuests);
  };

  const addGuestField = () => {
    setGuests([...guests, {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      category: "Others",
      priority: "Medium",
      status: "Pending",
      notes: "",
      custom_values: {},
    }]);
  };

  const removeGuestField = (index: number) => {
    if (guests.length === 1) {
      setGuests([{
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        category: "Others",
        priority: "Medium",
        status: "Pending",
        notes: "",
        custom_values: {},
      }]);
      return;
    }
    
    const updatedGuests = guests.filter((_, i) => i !== index);
    setGuests(updatedGuests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      const invalidGuests = guests.filter(g => !g.first_name);
      if (invalidGuests.length > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `First name is required for all guests (${invalidGuests.length} missing)`,
        });
        return;
      }

      const newGuests: NewGuest[] = guests.map(guest => ({
        user_id: session.user.id,
        first_name: guest.first_name || "",
        last_name: guest.last_name || "",
        email: guest.email || "",
        phone: guest.phone || "",
        category: guest.category || "Others",
        priority: (guest.priority || "Medium") as "High" | "Medium" | "Low",
        status: (guest.status || "Pending") as "Confirmed" | "Maybe" | "Unavailable" | "Pending",
        notes: guest.notes || "",
        custom_values: guest.custom_values || {},
        rsvp_status: mapStatusToRsvp((guest.status || "Pending") as "Confirmed" | "Maybe" | "Unavailable" | "Pending"),
      }));

      addGuests.mutate(newGuests, {
        onSuccess: onSuccess,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const FieldLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Guests</h2>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {guests.length} guest{guests.length !== 1 ? 's' : ''} to add
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={addGuestField}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Another Guest
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {guests.map((guest, index) => (
          <div key={index} className="border rounded-md p-4 relative">
            {guests.length > 1 && (
              <div className="absolute right-2 top-2 flex items-center gap-2">
                <Badge variant="outline">{`Guest ${index + 1}`}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGuestField(index)}
                  className="h-7 w-7"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
                
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`first_name_${index}`}>
                  <FieldLabel
                    label="First Name"
                    tooltip="The guest's first name (required)"
                  />
                </Label>
                <Input
                  id={`first_name_${index}`}
                  value={guest.first_name || ""}
                  onChange={(e) => handleInputChange(index, "first_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`last_name_${index}`}>
                  <FieldLabel
                    label="Last Name"
                    tooltip="The guest's last name (optional)"
                  />
                </Label>
                <Input
                  id={`last_name_${index}`}
                  value={guest.last_name || ""}
                  onChange={(e) => handleInputChange(index, "last_name", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor={`email_${index}`}>
                  <FieldLabel
                    label="Email"
                    tooltip="Contact email for digital invites"
                  />
                </Label>
                <Input
                  id={`email_${index}`}
                  type="email"
                  value={guest.email || ""}
                  onChange={(e) => handleInputChange(index, "email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`phone_${index}`}>
                  <FieldLabel
                    label="Phone"
                    tooltip="Contact phone number"
                  />
                </Label>
                <Input
                  id={`phone_${index}`}
                  value={guest.phone || ""}
                  onChange={(e) => handleInputChange(index, "phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor={`category_${index}`}>
                  <FieldLabel
                    label="Category"
                    tooltip="Guest relationship type (family, friends, work, etc.)"
                  />
                </Label>
                <Select
                  value={guest.category || "Others"}
                  onValueChange={(value) => handleInputChange(index, "category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friends">Friends</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`priority_${index}`}>
                  <FieldLabel
                    label="Priority"
                    tooltip="Importance level: High (VIPs), Medium (standard), Low (optional)"
                  />
                </Label>
                <Select
                  value={guest.priority || "Medium"}
                  onValueChange={(value) =>
                    handleInputChange(index, "priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High (VIP)</SelectItem>
                    <SelectItem value="Medium">Medium (Standard)</SelectItem>
                    <SelectItem value="Low">Low (Optional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`status_${index}`}>
                  <FieldLabel
                    label="Status"
                    tooltip="Attendance status: Confirmed, Maybe, Unavailable, or Pending"
                  />
                </Label>
                <Select
                  value={guest.status || "Pending"}
                  onValueChange={(value) =>
                    handleInputChange(index, "status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed">Confirmed (Attending)</SelectItem>
                    <SelectItem value="Maybe">Maybe (Undecided)</SelectItem>
                    <SelectItem value="Unavailable">Unavailable (Not Attending)</SelectItem>
                    <SelectItem value="Pending">Pending (No Response)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Label htmlFor={`notes_${index}`}>
                <FieldLabel
                  label="Notes"
                  tooltip="Additional information, special requests, dietary requirements, etc."
                />
              </Label>
              <Textarea
                id={`notes_${index}`}
                placeholder="Add any notes, special requirements, dietary restrictions, etc."
                value={guest.notes || ""}
                onChange={(e) => handleInputChange(index, "notes", e.target.value)}
                rows={2}
              />
            </div>

            {customFields.length > 0 && (
              <div className="space-y-3 mt-3">
                <h3 className="text-md font-medium">Custom Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`custom-${field.id}-${index}`}>
                        <FieldLabel
                          label={field.name}
                          tooltip={`Custom field: ${field.name} (${field.field_type})`}
                        />
                      </Label>
                      {field.field_type === "text" && (
                        <Input
                          id={`custom-${field.id}-${index}`}
                          value={guest.custom_values?.[field.name] || ""}
                          onChange={(e) => handleCustomValueChange(index, field.name, e.target.value)}
                          placeholder={`Enter ${field.name}`}
                        />
                      )}
                      {field.field_type === "number" && (
                        <Input
                          id={`custom-${field.id}-${index}`}
                          type="number"
                          value={guest.custom_values?.[field.name] || ""}
                          onChange={(e) => handleCustomValueChange(index, field.name, e.target.value)}
                          placeholder={`Enter ${field.name}`}
                        />
                      )}
                      {field.field_type === "date" && (
                        <Input
                          id={`custom-${field.id}-${index}`}
                          type="date"
                          value={guest.custom_values?.[field.name] || ""}
                          onChange={(e) => handleCustomValueChange(index, field.name, e.target.value)}
                        />
                      )}
                      {field.field_type === "select" && (
                        <Select
                          value={guest.custom_values?.[field.name] || ""}
                          onValueChange={(value) => handleCustomValueChange(index, field.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {index < guests.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        <div className="flex justify-between pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={addGuestField}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Guest
          </Button>
          
          <Button type="submit" className="px-6">
            {guests.length > 1 ? `Add ${guests.length} Guests` : "Add Guest"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGuestForm;
