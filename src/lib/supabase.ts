import { createClient } from "@supabase/supabase-js";

// Öz Supabase məlumatlarını bura yaz:
const SUPABASE_URL = "https://jixtliilzotxhdgbvktw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeHRsaWlsem90eGhkZ2J2a3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTk3NTAsImV4cCI6MjA4MjQ5NTc1MH0.fmW6CW4XH-gWQEdpWuoWa1mf7wZ6t2zZ35Ey4GBSHz4";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
