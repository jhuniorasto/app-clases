/**
 * Configuración de entornos
 *
 * ⚠️ IMPORTANTE: Este archivo se usa por defecto en desarrollo
 * Para producción, las variables deben configurarse en el servidor
 *
 * Las claves aquí son públicas (Firebase y Supabase permiten claves de cliente)
 * pero debes configurar reglas de seguridad en Firebase/Supabase
 */

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCja1v7E6PrD_kl2d2c7O9iZL5THC7_VoU',
    authDomain: 'app-clases-kj.firebaseapp.com',
    projectId: 'app-clases-kj',
    storageBucket: 'app-clases-kj.firebasestorage.app',
    messagingSenderId: '207648441749',
    appId: '1:207648441749:web:1d2a57906d81b84a7d629c',
  },
};
