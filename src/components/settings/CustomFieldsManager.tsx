
import { useState, useEffect } from "react";
import { CustomField, CustomFieldType, NewCustomField } from "@/types/custom-field";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Trash2, Settings, HelpCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const CustomFieldsManager = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newField, setNewField] = useState<NewCustomField>({
    name: "",
    field_type: "text",
    options: [],
  });
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();

  const fetchCustomFields = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Cast the data to ensure field_type is of type CustomFieldType
      const typedData = data?.map(field => ({
        ...field,
        field_type: field.field_type as CustomFieldType,
        options: field.options as string[] || []
      })) || [];

      setCustomFields(typedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const handleAddOption = () => {
    if (newOption && newField.options) {
      setNewField({
        ...newField,
        options: [...newField.options, newOption],
      });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newField.options) {
      setNewField({
        ...newField,
        options: newField.options.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { error } = await supabase
        .from("custom_fields")
        .insert([{
          ...newField,
          user_id: session.user.id,
          options: newField.field_type === 'select' ? newField.options : null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom field added successfully",
      });

      setNewField({
        name: "",
        field_type: "text",
        options: [],
      });
      fetchCustomFields();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_fields")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });

      fetchCustomFields();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  // Helper component for field label with tooltip
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

  if (isLoading) {
    return <div>Loading custom fields...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <CardTitle>Custom Fields</CardTitle>
        </div>
        <CardDescription>
          Add and manage custom fields for collecting additional guest information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About Custom Fields</AlertTitle>
          <AlertDescription>
            Custom fields allow you to collect specific information from your guests beyond the standard fields.
            These fields will appear in guest forms, list views, and can be used for filtering. They are also included in exports.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <FieldLabel 
                  label="Field Name" 
                  tooltip="The name of your custom field (e.g., 'Diet Preference', 'T-Shirt Size')"
                />
              </Label>
              <Input
                id="name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                required
                placeholder="Enter field name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">
                <FieldLabel 
                  label="Field Type" 
                  tooltip="Text: Free form text entry | Number: Numeric values only | Date: Calendar date picker | Select: Dropdown with predefined options"
                />
              </Label>
              <Select
                value={newField.field_type}
                onValueChange={(value) => setNewField({ ...newField, field_type: value as CustomFieldType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newField.field_type === "select" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add an option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleAddOption}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {newField.options && newField.options.length > 0 && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {newField.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-gray-50 rounded">{option}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button type="submit">Add Custom Field</Button>
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Custom Fields</h3>
          {customFields.length === 0 ? (
            <p className="text-gray-500">No custom fields added yet.</p>
          ) : (
            <div className="space-y-2">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div>
                    <h4 className="font-medium">{field.name}</h4>
                    <p className="text-sm text-gray-500">Type: {field.field_type}</p>
                    {field.options && field.options.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Options: {field.options.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(field.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t rounded-b-lg">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Info className="h-4 w-4" />
          <p>Custom fields will appear in guest forms, list views, and exports.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomFieldsManager;
