import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yuohraqnfyvnacvhkadc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1b2hyYXFuZnl2bmFjdmhrYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzIzNDYsImV4cCI6MjA2NzEwODM0Nn0.2iplNIZ-cr_cGpLpmicrOIWHgMnzienDt5-uYyXiHXw";

export const supabase = createClient(supabaseUrl, supabaseKey);
