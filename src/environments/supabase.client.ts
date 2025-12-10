/**
 * Cliente de Supabase
 *
 * ⚠️ NOTA: La clave anónima (anon key) es segura para usar en el cliente
 * siempre que tengas configuradas las Row Level Security (RLS) policies en Supabase
 *
 * Para producción, considera usar variables de entorno del servidor
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hnuvcflxhoppwgpdasvw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudXZjZmx4aG9wcHdncGRhc3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzA0MjEsImV4cCI6MjA3NzUwNjQyMX0.I7EV-wzr-5wcrc52hDSt6780KS5llvgfchqZVYe25vs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
