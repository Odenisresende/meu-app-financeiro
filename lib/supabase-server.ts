import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://iyltagcmvocbdvebrnih.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHRhZ2Ntdm9jYmR2ZWJybmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc2MTUsImV4cCI6MjA2NzE2MzYxNX0.RP1LSlSpR4ub2BJfvKIzr0dCAi5unN9OO6UWDdJleOE"

export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

export const supabaseServer = createServerSupabaseClient()
