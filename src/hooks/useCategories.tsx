
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";
import { useToast } from "@/components/ui/use-toast";

export const useCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: categories = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name', { ascending: true });

        if (error) throw error;
        return data as Category[];
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    }
  });

  const addCategory = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('categories')
        .insert([
          { ...newCategory, user_id: session.user.id }
        ])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add category",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (category: Category) => {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description
        })
        .eq('id', category.id);

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update category",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete category",
      });
    },
  });

  // Helper function to get category color
  const getCategoryColor = (categoryName: string) => {
    const defaultColors = {
      Family: "bg-purple-100 text-purple-800 border-purple-200",
      Friends: "bg-blue-100 text-blue-800 border-blue-200",
      Work: "bg-orange-100 text-orange-800 border-orange-200",
      Others: "bg-gray-100 text-gray-800 border-gray-200"
    };

    // Check if it's one of the default categories
    if (categoryName in defaultColors) {
      return defaultColors[categoryName as keyof typeof defaultColors];
    }
    
    // For custom categories, return a consistent color based on the name
    // This ensures the same category always gets the same color
    const customColors = [
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-lime-100 text-lime-800 border-lime-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-violet-100 text-violet-800 border-violet-200",
      "bg-rose-100 text-rose-800 border-rose-200"
    ];
    
    // Use the sum of character codes to create a deterministic index
    const charSum = categoryName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % customColors.length;
    
    return customColors[colorIndex];
  };

  return {
    categories,
    isLoading,
    error,
    refetch,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryColor
  };
};
