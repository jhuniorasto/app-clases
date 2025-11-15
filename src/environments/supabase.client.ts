import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://hnuvcflxhoppwgpdasvw.supabase.co', // Reemplaza con tu URL de Supabase
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudXZjZmx4aG9wcHdncGRhc3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzA0MjEsImV4cCI6MjA3NzUwNjQyMX0.I7EV-wzr-5wcrc52hDSt6780KS5llvgfchqZVYe25vs' // Reemplaza con tu clave anónima de Supabase
);
