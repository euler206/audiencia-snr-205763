
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gibyedrminxshuvogjfh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYnllZHJtaW54c2h1dm9namZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDAzODgsImV4cCI6MjA2MTgxNjM4OH0.usiaC45FfOgW5RpGdefolFkIN-JO7049jxZzTk8dK7c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
