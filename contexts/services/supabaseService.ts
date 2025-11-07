import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybvwopgikkeehrdyphdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidndvcGdpa2tlZWhyZHlwaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Njc1MjgsImV4cCI6MjA3ODA0MzUyOH0.FXdcgqlzNSqC3O2dhxSRrKqaFWlzzOEh99mMWqMJ_QI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
