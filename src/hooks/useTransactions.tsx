import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, UserSubscription } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch user's current subscription
  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ planId, paymentMethod, metadata = {} }: {
      planId: string;
      paymentMethod: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          plan_id: planId,
          payment_method: paymentMethod,
          metadata
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch all related data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['guestCount'] });
      queryClient.invalidateQueries({ queryKey: ['planConfigurations'] });
      
      if (data.transaction_id) {
        // Navigate to loading page with transaction details
        const params = new URLSearchParams({
          transaction_id: data.transaction_id,
          plan_id: variables.planId
        });
        window.location.href = `/payment-loading?${params.toString()}`;
      } else if (data.redirect_url) {
        // For external payment gateways
        window.open(data.redirect_url, '_blank');
      }

      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. Please wait while we confirm your transaction.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    transactionsLoading,
    transactionsError,
    currentSubscription,
    subscriptionLoading,
    subscriptionError,
    processPayment: processPaymentMutation.mutate,
    isProcessingPayment: processPaymentMutation.isPending,
  };
}