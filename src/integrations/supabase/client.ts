// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://epceelllcnuspgnnwzid.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwY2VlbGxsY251c3Bnbm53emlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNjcwNzcsImV4cCI6MjA0OTY0MzA3N30.NLu6cTLu6-OhyMuzKugVAVCr0-DcfZlxRd3BE_hwOX0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);