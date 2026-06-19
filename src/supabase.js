import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxofdtosrrfvtgcmyopp.supabase.co';   
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b2ZkdG9zcnJmdnRnY215b3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjA0ODYsImV4cCI6MjA5NzE5NjQ4Nn0.GjfTvbsh_LXRorHTWxfON8bwHkf4_jRGL5ce2miRTI4';              

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);