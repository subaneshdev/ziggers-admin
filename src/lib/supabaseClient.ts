import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://crqvvcxmbvvcngfqdsnj.supabase.co';
const SUPABASE_KEY = 
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycXZ2Y3htYnZ2Y25nZnFkc25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc6NjkxNTA4MywiZXhwIjoyMDgyNDkxMDgzfQ.1JjQpDIiXLCyW3KmGoCEPttyVZjxKkrS7jHu1r4xe-Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
