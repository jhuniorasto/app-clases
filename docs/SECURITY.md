# Guía de configuración de seguridad

## Variables de entorno

### Desarrollo local

1. Copiar `.env.example` a `.env`
2. Configurar tus propias claves de desarrollo
3. El archivo `.env` está en `.gitignore` y NO debe commitearse

### Producción

Las variables de entorno deben configurarse en el servidor de despliegue:

#### Heroku

```bash
heroku config:set FIREBASE_API_KEY=your_key
heroku config:set SUPABASE_URL=your_url
```

#### Vercel/Netlify

Configurar en el panel de variables de entorno del proyecto

#### Railway

Usar el panel de variables o railway.json

## Seguridad Firebase

### Claves públicas vs privadas

- **API Key**: Es segura para usar en el cliente, controla el acceso mediante reglas
- **Service Account**: NUNCA usar en el cliente, solo en backend

### Firestore Security Rules

Asegúrate de tener reglas configuradas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios solo pueden leer/escribir sus propios datos
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Cursos: todos leen, solo docentes/admins escriben
    match /cursos/{cursoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol in ['docente', 'admin']);
    }

    // Inscripciones: usuarios leen las suyas, admins todas
    match /inscripciones/{inscripcionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
  }
}
```

## Seguridad Supabase

### Row Level Security (RLS)

Habilitar RLS en todas las tablas de Supabase y configurar policies:

```sql
-- Ejemplo: usuarios pueden leer su propia información
CREATE POLICY "Users can read own data" ON usuarios
  FOR SELECT USING (auth.uid() = uid);

-- Admins pueden leer todo
CREATE POLICY "Admins can read all" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE uid = auth.uid() AND rol = 'admin'
    )
  );
```

## Checklist de seguridad

- [ ] Configurar Firebase Security Rules
- [ ] Habilitar RLS en Supabase
- [ ] No commitear archivos .env
- [ ] Usar variables de entorno en producción
- [ ] Rotar claves periódicamente
- [ ] Monitorear uso de cuotas en Firebase/Supabase
- [ ] Configurar CORS en APIs externas
- [ ] Habilitar autenticación de dos factores en cuentas de Firebase/Supabase
