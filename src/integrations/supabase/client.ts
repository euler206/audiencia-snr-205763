// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gibyedrminxshuvogjfh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYnllZHJtaW54c2h1dm9namZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDAzODgsImV4cCI6MjA2MTgxNjM4OH0.usiaC45FfOgW5RpGdefolFkIN-JO7049jxZzTk8dK7c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);