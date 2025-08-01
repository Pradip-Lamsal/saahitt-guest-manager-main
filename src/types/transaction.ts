export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  payment_provider?: string;
  transaction_reference?: string;
  encrypted_payment_data?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failed_reason?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  transaction_id?: string;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  activated_at: string;
  expires_at?: string;
  previous_plan_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionRequest {
  plan_id: string;
  payment_method: string;
  metadata?: Record<string, any>;
}

export interface TransactionResponse {
  transaction_id: string;
  status: string;
  redirect_url?: string;
  message?: string;
}