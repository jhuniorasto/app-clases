/**
 * Entornos de desarrollo y producción
 *
 * ⚠️ IMPORTANTE: No commitear este archivo con claves reales
 * Para desarrollo local, copia este archivo a environment.development.ts
 * y configura tus propias claves
 */

export const environment = {
  production: false,
  firebase: {
    apiKey:
      process.env['FIREBASE_API_KEY'] ||
      'AIzaSyCja1v7E6PrD_kl2d2c7O9iZL5THC7_VoU',
    authDomain:
      process.env['FIREBASE_AUTH_DOMAIN'] || 'app-clases-kj.firebaseapp.com',
    projectId: process.env['FIREBASE_PROJECT_ID'] || 'app-clases-kj',
    storageBucket:
      process.env['FIREBASE_STORAGE_BUCKET'] ||
      'app-clases-kj.firebasestorage.app',
    messagingSenderId:
      process.env['FIREBASE_MESSAGING_SENDER_ID'] || '207648441749',
    appId:
      process.env['FIREBASE_APP_ID'] ||
      '1:207648441749:web:1d2a57906d81b84a7d629c',
  },
  supabase: {
    url:
      process.env['SUPABASE_URL'] || 'https://hnuvcflxhoppwgpdasvw.supabase.co',
    anonKey:
      process.env['SUPABASE_ANON_KEY'] ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudXZjZmx4aG9wcHdncGRhc3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzA0MjEsImV4cCI6MjA3NzUwNjQyMX0.I7EV-wzr-5wcrc52hDSt6780KS5llvgfchqZVYe25vs',
  },
};
