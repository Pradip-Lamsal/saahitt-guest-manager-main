
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomField, CustomFieldType, NewCustomField } from "@/types/custom-field";
import { useToast } from "@/components/ui/use-toast";

export const useCustomFields = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: customFields = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customFields'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from('custom_fields')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        return data?.map(field => ({
          ...field,
          field_type: field.field_type as CustomFieldType,
          options: field.options as string[] || []
        })) || [];
      } catch (error) {
        console.error("Error fetching custom fields:", error);
        throw error;
      }
    }
  });

  const addCustomField = useMutation({
    mutationFn: async (newField: NewCustomField) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('custom_fields')
        .insert([{
          ...newField,
          user_id: session.user.id,
          options: newField.field_type === 'select' ? newField.options : null,
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add custom field",
      });
    },
  });

  const updateCustomField = useMutation({
    mutationFn: async (field: CustomField) => {
      const { error } = await supabase
        .from('custom_fields')
        .update({
          name: field.name,
          field_type: field.field_type,
          options: field.field_type === 'select' ? field.options : null
        })
        .eq('id', field.id);

      if (error) throw error;
      return field;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update custom field",
      });
    },
  });

  const deleteCustomField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete custom field",
      });
    },
  });

  // Helper function to format custom field values for display
  const formatCustomFieldValue = (field: CustomField, value: any) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    
    switch (field.field_type) {
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      case 'number':
        return Number(value).toString();
      default:
        return String(value);
    }
  };

  return {
    customFields,
    isLoading,
    error,
    refetch,
    addCustomField,
    updateCustomField,
    deleteCustomField,
    formatCustomFieldValue
  };
};
