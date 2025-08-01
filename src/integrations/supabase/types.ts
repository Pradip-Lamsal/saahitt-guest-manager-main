export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          created_at: string
          field_type: string
          id: string
          name: string
          options: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_type: string
          id?: string
          name: string
          options?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_guests: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          invite_method: string | null
          invite_notes: string | null
          invite_sent: boolean | null
          invite_sent_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          invite_method?: string | null
          invite_notes?: string | null
          invite_sent?: boolean | null
          invite_sent_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          invite_method?: string | null
          invite_notes?: string | null
          invite_sent?: boolean | null
          invite_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_guests_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempt_count: number
          email: string
          id: string
          ip_address: string | null
          last_attempt_at: string
          locked_until: string | null
          user_id: string | null
        }
        Insert: {
          attempt_count?: number
          email: string
          id?: string
          ip_address?: string | null
          last_attempt_at?: string
          locked_until?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_count?: number
          email?: string
          id?: string
          ip_address?: string | null
          last_attempt_at?: string
          locked_until?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          category: string | null
          created_at: string
          custom_values: Json | null
          email: string | null
          first_name: string
          id: string
          invited_at: string | null
          last_name: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          rsvp_at: string | null
          rsvp_details: Json | null
          rsvp_status: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          custom_values?: Json | null
          email?: string | null
          first_name: string
          id?: string
          invited_at?: string | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          rsvp_at?: string | null
          rsvp_details?: Json | null
          rsvp_status?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          custom_values?: Json | null
          email?: string | null
          first_name?: string
          id?: string
          invited_at?: string | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          rsvp_at?: string | null
          rsvp_details?: Json | null
          rsvp_status?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      password_policy_config: {
        Row: {
          id: number
          lockout_duration_minutes: number
          max_failed_attempts: number
          max_length: number
          min_length: number
          password_expiry_days: number
          password_history_count: number
          require_lowercase: boolean
          require_numbers: boolean
          require_special_chars: boolean
          require_uppercase: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          lockout_duration_minutes?: number
          max_failed_attempts?: number
          max_length?: number
          min_length?: number
          password_expiry_days?: number
          password_history_count?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          lockout_duration_minutes?: number
          max_failed_attempts?: number
          max_length?: number
          min_length?: number
          password_expiry_days?: number
          password_history_count?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_configurations: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          guest_limit: number
          id: number
          is_active: boolean | null
          name: string
          plan_id: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          guest_limit: number
          id?: number
          is_active?: boolean | null
          name: string
          plan_id: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          guest_limit?: number
          id?: number
          is_active?: boolean | null
          name?: string
          plan_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          plan_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      rsvp_tokens: {
        Row: {
          created_at: string
          event_id: string
          expires_at: string
          guest_id: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          expires_at: string
          guest_id: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          expires_at?: string
          guest_id?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_tokens_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_tokens_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          encrypted_payment_data: Json | null
          failed_reason: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_provider: string | null
          plan_id: string
          status: string
          transaction_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          encrypted_payment_data?: Json | null
          failed_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          plan_id: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          encrypted_payment_data?: Json | null
          failed_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          plan_id?: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          activated_at: string
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          previous_plan_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          previous_plan_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          previous_plan_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_password_reuse: {
        Args: { p_user_id: string; p_password_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
