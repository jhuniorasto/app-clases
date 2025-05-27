import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://onpyctvrjqzkqgkbykai.supabase.co', // Reemplaza con tu URL de Supabase
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucHljdHZyanF6a3Fna2J5a2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzQ1MzUsImV4cCI6MjA2Mzk1MDUzNX0.Ot-uETmXEihUPd8tl7To6rWGBT8rFGGg4mbudhh3yhw' // Reemplaza con tu clave anónima de Supabase
);
