import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qeimmljfkhmpdqobveuj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaW1tbGpma2htcGRxb2J2ZXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTk4MzksImV4cCI6MjA5MDI5NTgzOX0.4pBzFK8V5HIG3AK6FGC-8ocFmpyNFkLZfQgcBw0Zchk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
