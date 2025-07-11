import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// For client-side usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For client components
export const createClient = () => createClientComponentClient();

// For server components
export const createServerClient = () => createServerComponentClient({ cookies });

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'user';
          credits: number;
          banned_at: string | null;
          stripe_customer_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'admin' | 'user';
          credits?: number;
          banned_at?: string | null;
          stripe_customer_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'user';
          credits?: number;
          banned_at?: string | null;
          stripe_customer_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          plan_id: string;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      images: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          processed_url: string | null;
          operation_type: 'enhance' | 'remove_object' | 'style_transfer' | 'text_to_image' | 'avatar_generation';
          credits_used: number;
          processing_status: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_url: string;
          processed_url?: string | null;
          operation_type: 'enhance' | 'remove_object' | 'style_transfer' | 'text_to_image' | 'avatar_generation';
          credits_used?: number;
          processing_status?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: 'purchase' | 'usage' | 'admin_adjustment' | 'subscription_bonus';
          description: string | null;
          metadata: any;
          created_at: string;
        };
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_user_id: string;
          details: any;
          created_at: string;
        };
      };
      ai_models: {
        Row: {
          id: string;
          name: string;
          model_type: 'enhance' | 'remove_object' | 'style_transfer' | 'text_to_image' | 'avatar_generation';
          endpoint: string;
          credit_cost: number;
          enabled: boolean;
          config: any;
          created_at: string;
        };
      };
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Image = Database['public']['Tables']['images']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type AdminLog = Database['public']['Tables']['admin_logs']['Row'];
export type AIModel = Database['public']['Tables']['ai_models']['Row'];