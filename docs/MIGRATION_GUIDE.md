# Guía de migración arquitectónica

## 📋 Resumen de cambios implementados

### 1. Estructura de carpetas (✅ Completado)

```
src/app/
├── core/                    # Lógica central y servicios singleton
│   ├── guards/             # Auth y role guards
│   ├── services/           # Servicios core (mover aquí auth, admin, etc.)
│   ├── data/               # Utilidades Firestore comunes
│   └── interceptors/       # HTTP interceptors (futuro)
├── shared/                  # Componentes y utilidades reutilizables
│   ├── components/         # Componentes UI reutilizables
│   ├── models/             # Modelos de datos (mover aquí desde app/models)
│   ├── pipes/              # Pipes personalizados
│   └── directives/         # Directivas compartidas
├── features/                # Módulos por funcionalidad
│   ├── auth/               # Login, registro
│   ├── admin/              # Panel admin
│   ├── docente/            # Funcionalidades docente
│   ├── estudiante/         # Funcionalidades estudiante
│   └── home/               # Home y landing
└── components/              # (LEGACY - migrar gradualmente)
```

### 2. Utilidades Firestore (✅ Completado)

- **Archivo**: `core/data/firestore.utils.ts`
- **Funciones**:
  - `serializeDate()` / `deserializeDate()` - Conversión de fechas
  - `createDocument()`, `getDocumentById()`, `updateDocument()`, `deleteDocument()`
  - `handleFirestoreError()` - Manejo centralizado de errores
  - `queryDocuments()`, `documentExists()`

### 3. Servicios refactorizados (✅ Completado)

- ✅ `CursoService` - Usa utilidades comunes
- ✅ `ClaseService` - Usa utilidades comunes
- ✅ `InscripcionService` - Usa utilidades comunes
- ⏳ `AuthService` - Pendiente refactor completo
- ⏳ `AdminService` - Pendiente refactor completo
- ⏳ `UsuarioService` - Pendiente refactor

### 4. Configuración y seguridad (✅ Completado)

- ✅ Archivos de entorno separados (development/production)
- ✅ `.env.example` para desarrollo local
- ✅ Documentación de seguridad en `docs/SECURITY.md`
- ✅ Comentarios sobre claves públicas vs privadas

### 5. Guards modernos (✅ Completado)

- ✅ Movidos a `core/guards/`
- ✅ Implementan `CanMatch` para lazy loading eficiente
- ✅ Redirigen a `/forbidden` en lugar de `/signin` para errores de rol

### 6. Rutas mejoradas (✅ Preparado)

- ✅ Archivo nuevo: `app.routes.new.ts`
- ✅ Usa `canMatch` en lugar de `canLoad`
- ✅ Títulos de página configurados
- ✅ Página 404 y 403
- ⏳ Pendiente: reemplazar app.routes.ts actual

## 🚀 Pasos siguientes recomendados

### Fase 1: Finalizar migración de estructura (1-2 días)

1. **Mover modelos a shared/models**

   ```bash
   # TODO: Mover archivos de models/ a shared/models/
   # Actualizar imports en todos los servicios
   ```

2. **Mover servicios a core/services**

   ```bash
   # TODO: Mover auth.service.ts, admin.service.ts, etc. a core/services/
   # Actualizar imports en componentes
   ```

3. **Activar nuevas rutas**

   ```typescript
   // TODO: Reemplazar app.routes.ts con app.routes.new.ts
   // Verificar que todos los guards importan desde core/guards
   ```

4. **Mover layout a shared**
   ```bash
   # TODO: Mover components/layout/ a shared/components/layout/
   # Mover navbar y footer a shared/components/
   ```

### Fase 2: Optimizaciones de rendimiento (2-3 días)

1. **Aplicar OnPush en componentes de lista**

   ```typescript
   // TODO: Agregar ChangeDetectionStrategy.OnPush en:
   // - GestionCursosComponent
   // - GestionUsuariosComponent
   // - GestionInscripcionesComponent
   // - GestionHorariosComponent
   // - Componentes de listado de estudiante/docente
   ```

2. **Usar async pipe**

   ```typescript
   // TODO: Refactorizar componentes para usar observables con async pipe
   // Ejemplo: cursos$ = this.cursoService.obtenerCursos();
   // Template: *ngFor="let curso of cursos$ | async"
   ```

3. **Implementar trackBy**
   ```typescript
   // TODO: Agregar trackBy functions en todos los *ngFor
   // trackByFn(index, item) { return item.id; }
   ```

### Fase 3: Configuración de herramientas (1 día)

1. **ESLint + Prettier**

   ```bash
   npm install -D eslint @angular-eslint/builder @angular-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier
   ```

2. **Configurar reglas**
   - Crear `.eslintrc.json`
   - Crear `.prettierrc`
   - Agregar scripts en package.json

### Fase 4: Testing (2-3 días)

1. **Tests unitarios de utilidades**
   - `firestore.utils.spec.ts`
   - Tests de guards refactorizados
2. **Tests de servicios refactorizados**
   - Verificar que los cambios no rompieron funcionalidad

## 🤖 Cómo usar GitHub Copilot

### Prompts útiles para migración

#### 1. Mover archivos y actualizar imports

```
// Prompt: "Actualiza todos los imports de guards para que apunten a core/guards en este archivo"
```

#### 2. Refactorizar servicios

```
// Prompt: "Refactoriza este servicio para usar las utilidades de core/data/firestore.utils como lo hacen CursoService e InscripcionService"
```

#### 3. Aplicar OnPush

```
// Prompt: "Convierte este componente para usar ChangeDetectionStrategy.OnPush y async pipe"
```

#### 4. Crear tests

```
// Prompt: "Genera tests unitarios para este servicio usando Jasmine y las utilidades de testing de Angular"
```

### Marcadores TODO para Copilot

Agrega estos comentarios en tu código para guiar a Copilot:

```typescript
// TODO: [COPILOT] Refactorizar para usar firestore.utils
// TODO: [COPILOT] Aplicar OnPush strategy
// TODO: [COPILOT] Agregar trackBy function
// TODO: [COPILOT] Convertir a observable con async pipe
// TODO: [COPILOT] Agregar manejo de errores con handleFirestoreError
```

## 📊 Checklist de migración

### Core

- [x] Crear estructura core/guards
- [x] Crear estructura core/services
- [x] Crear estructura core/data
- [x] Crear utilidades Firestore
- [ ] Mover todos los guards
- [ ] Mover todos los servicios
- [ ] Crear index.ts para exports

### Shared

- [x] Crear estructura shared/components
- [x] Crear estructura shared/models
- [x] Crear estructura shared/pipes
- [x] Crear estructura shared/directives
- [x] Crear componentes 404 y 403
- [ ] Mover todos los modelos
- [ ] Mover layout/navbar/footer
- [ ] Crear componentes UI reutilizables

### Features

- [x] Crear estructura features/
- [ ] Mover componentes auth a features/auth
- [ ] Mover componentes admin a features/admin
- [ ] Mover componentes docente a features/docente
- [ ] Mover componentes estudiante a features/estudiante

### Routing

- [x] Crear rutas mejoradas con canMatch
- [x] Agregar títulos de página
- [x] Agregar rutas de error
- [ ] Activar nuevas rutas
- [ ] Verificar navegación

### Performance

- [ ] Aplicar OnPush en 10+ componentes
- [ ] Implementar trackBy en todos los \*ngFor
- [ ] Convertir suscripciones a async pipe
- [ ] Lazy load de imágenes

### Tools

- [ ] Configurar ESLint
- [ ] Configurar Prettier
- [ ] Configurar pre-commit hooks
- [ ] Actualizar scripts de package.json

### Testing

- [ ] Tests de firestore.utils
- [ ] Tests de guards actualizados
- [ ] Tests de servicios refactorizados
- [ ] Tests E2E de flujos críticos

## 🎯 Objetivos de rendimiento

- **Bundle size**: Reducir en 20% con lazy loading adecuado
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Change Detection cycles**: Reducir en 40% con OnPush

## 📚 Referencias

- [Angular Architecture Guide](https://angular.io/guide/architecture)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Angular Performance](https://angular.io/guide/performance-best-practices)
