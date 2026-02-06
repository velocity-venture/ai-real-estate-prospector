import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL and Anon Key must be set in environment variables");
      }
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_supabase as unknown as Record<string, unknown>)[prop as string];
  },
});

export interface Lead {
  id?: string;
  zip_code: string;
  address: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string | null;
  equity_percent: number;
  years_owned: number;
  intent_score: number;
  email_content: string | null;
  sms_content: string | null;
  email_sent: boolean;
  sms_sent: boolean;
  created_at?: string;
  updated_at?: string;
}
