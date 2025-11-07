import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT DEPLOYMENT NOTE ---
// The generic "Failed to fetch" error when deploying to services like Vercel
// is often caused by missing environment variables or incorrect CORS settings.
//
// 1. Environment Variables:
//    - Your Supabase URL and Anon Key should be stored as environment variables in your deployment environment.
//    - For Vercel, add SUPABASE_URL and SUPABASE_ANON_KEY to your project's settings.
//    - The values below will be used as fallbacks if the environment variables are not set.
//
// 2. CORS (Cross-Origin Resource Sharing):
//    - Add your Vercel deployment URL (e.g., https://your-project.vercel.app) to your
//      Supabase project's list of allowed origins.
//    - Find this in your Supabase Dashboard under: Authentication -> URL Configuration.

const supabaseUrl = process.env.SUPABASE_URL || 'https://ybvwopgikkeehrdyphdm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidndvcGdpa2tlZWhyZHlwaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Njc1MjgsImV4cCI6MjA3ODA0MzUyOH0.FXdcgqlzNSqC3O2dhxSRrKqaFWlzzOEh99mMWqMJ_QI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
