
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { Category } from "@/types/category";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GuestDetailViewProps {
  guestId: string;
  editMode: boolean;
  onEdit: () => void;
  onUpdate: (guest: Guest) => void;
  onClose: () => void;
}

// Category colors for visual distinction
const categoryColors = {
  Family: "bg-purple-100 text-purple-800 border-purple-200",
  Friends: "bg-blue-100 text-blue-800 border-blue-200",
  Work: "bg-orange-100 text-orange-800 border-orange-200",
  Others: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusColors = {
  Confirmed: "bg-green-100 text-green-800",
  Maybe: "bg-yellow-100 text-yellow-800",
  Unavailable: "bg-red-100 text-red-800",
  Pending: "bg-gray-100 text-gray-800",
};

const GuestDetailView = ({
  guestId,
  editMode,
  onEdit,
  onUpdate,
  onClose,
}: GuestDetailViewProps) => {
  const [guestForm, setGuestForm] = useState<Partial<Guest> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  // Fetch guest details
  const { data: guest, isLoading: isLoadingGuest } = useQuery({
    queryKey: ["guest", guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("id", guestId)
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
        priority: data.priority as Guest["priority"],
        status: data.status as Guest["status"],
        custom_values: data.custom_values || {},
      } as Guest;
    },
  });

  // Fetch custom fields
  const { data: customFields = [], isLoading: isLoadingFields } = useQuery({
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

  // Fetch custom categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Update form data when guest changes or edit mode changes
  useEffect(() => {
    if (guest) {
      setGuestForm(guest);
    }
  }, [guest, editMode]);

  const handleInputChange = (field: string, value: string) => {
    setGuestForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleCustomValueChange = (field: string, value: string) => {
    setGuestForm((prev) => {
      if (!prev) return null;
      
      // Ensure custom_values is treated as an object type
      const customValues = typeof prev.custom_values === 'object' && prev.custom_values !== null 
        ? prev.custom_values 
        : {};
        
      return {
        ...prev,
        custom_values: {
          ...customValues,
          [field]: value,
        },
      };
    });
  };

  const handleSave = () => {
    if (!guestForm || !guest) return;

    const updatedGuest: Guest = {
      ...guest,
      ...guestForm,
      custom_values: guestForm.custom_values || {},
    };

    onUpdate(updatedGuest);
  };

  // Function to get category color based on the category name
  const getCategoryColor = (category: string) => {
    if (category in categoryColors) {
      return categoryColors[category as keyof typeof categoryColors];
    }
    // Return a default color for custom categories
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  const isLoading = isLoadingGuest || isLoadingFields;

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!guest) {
    return <div>Guest not found</div>;
  }

  return (
    <div className="space-y-4 py-4">
      {!editMode ? (
        // View Mode
        <div className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {guest.first_name} {guest.last_name}
              </h3>
              <div className="flex space-x-2 mt-2">
                <Badge className={getCategoryColor(guest.category)}>
                  {guest.category}
                </Badge>
                <Badge className={priorityColors[guest.priority]}>
                  {guest.priority}
                </Badge>
                <Badge className={statusColors[guest.status]}>
                  {guest.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Email</Label>
              <p>{guest.email || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-gray-500">Phone</Label>
              <p>{guest.phone || "Not provided"}</p>
            </div>
          </div>

          {guest.notes && (
            <div>
              <Label className="text-gray-500">Notes</Label>
              <p className="whitespace-pre-line">{guest.notes}</p>
            </div>
          )}

          {customFields.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Custom Fields</h4>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <Label className="text-gray-500">{field.name}</Label>
                    <p>{guest.custom_values[field.name] || "Not set"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={guestForm?.first_name || ""}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={guestForm?.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guestForm?.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={guestForm?.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={guestForm?.category || "Others"}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  {/* Display custom categories */}
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
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={guestForm?.priority || "Medium"}
                onValueChange={(value) =>
                  handleInputChange("priority", value as Guest["priority"])
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={guestForm?.status || "Pending"}
                onValueChange={(value) =>
                  handleInputChange("status", value as Guest["status"])
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any special notes, dietary restrictions, etc."
              value={guestForm?.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {customFields.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Custom Fields</h4>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
                    {field.field_type === "text" ? (
                      <Input
                        id={`custom-${field.id}`}
                        value={guestForm?.custom_values?.[field.name] || ""}
                        onChange={(e) =>
                          handleCustomValueChange(field.name, e.target.value)
                        }
                      />
                    ) : field.field_type === "select" ? (
                      <Select
                        value={guestForm?.custom_values?.[field.name] || ""}
                        onValueChange={(value) =>
                          handleCustomValueChange(field.name, value)
                        }
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
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestDetailView;
