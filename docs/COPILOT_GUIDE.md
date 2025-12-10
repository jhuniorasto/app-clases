# GitHub Copilot - Guía de uso para este proyecto

## 🎯 Contexto del proyecto

Esta es una aplicación Angular 19 para gestión de cursos con:

- **Firebase**: Autenticación y Firestore
- **Supabase**: Storage
- **Roles**: Admin, Docente, Estudiante
- **SSR**: Habilitado con Angular Universal

## 📁 Arquitectura actual

```
core/       → Servicios singleton, guards, utilidades de datos
shared/     → Componentes UI, modelos, pipes, directivas reutilizables
features/   → Módulos por funcionalidad (auth, admin, docente, estudiante)
components/ → (Legacy) Componentes a migrar gradualmente
```

## 🤖 Prompts efectivos por tarea

### 1. Crear componentes con OnPush

**Prompt:**

```
Crea un componente standalone de Angular 19 para [descripción] que:
- Use ChangeDetectionStrategy.OnPush
- Importe CommonModule y RouterLink
- Use async pipe para observables
- Incluya trackBy functions para *ngFor
- Tenga estilos inline básicos con clases de Bootstrap 5
```

**Ejemplo:**

```typescript
// @Copilot Crea un componente para mostrar la lista de cursos del estudiante con OnPush, async pipe y trackBy
```

### 2. Refactorizar servicios con utilidades

**Prompt:**

```
Refactoriza este servicio para usar las utilidades de core/data/firestore.utils:
- Usa createDocument(), getDocumentById(), updateDocument(), deleteDocument()
- Usa serializeDates() para fechas
- Usa handleFirestoreError() para errores
- Define COLLECTION_PATH como constante
- Sigue el patrón de CursoService e InscripcionService
```

**Ejemplo:**

```typescript
// @Copilot Refactoriza UsuarioService para usar firestore.utils como lo hace CursoService
```

### 3. Crear guards modernos

**Prompt:**

```
Crea un guard de Angular que implemente CanActivate, CanMatch y CanLoad para [propósito].
Debe usar observables, redirigir con createUrlTree y seguir el patrón de AuthGuard.
```

### 4. Optimizar componentes existentes

**Prompt:**

```
Optimiza este componente para:
1. Cambiar a OnPush
2. Convertir suscripciones manuales a async pipe
3. Agregar trackBy en los *ngFor
4. Usar @if y @for (sintaxis Angular 17+) en lugar de *ngIf/*ngFor
5. Desuscribir en ngOnDestroy si quedan suscripciones
```

### 5. Crear tests unitarios

**Prompt:**

```
Genera tests unitarios completos con Jasmine para este [servicio/componente/guard]:
- Mock de dependencias (Firestore, Router, etc.)
- Tests de casos exitosos
- Tests de manejo de errores
- Coverage mínimo del 80%
```

**Ejemplo:**

```typescript
// @Copilot Genera tests para firestore.utils con mocks de Firestore
```

### 6. Migrar componentes a features

**Prompt:**

```
Refactoriza este componente para moverlo de components/[area] a features/[area]:
- Actualiza imports de guards a core/guards
- Actualiza imports de servicios a core/services
- Actualiza imports de modelos a shared/models
- Mantén standalone: true
- Asegura compatibilidad con lazy loading
```

### 7. Crear formularios reactivos

**Prompt:**

```
Crea un formulario reactivo de Angular para [propósito] con:
- ReactiveFormsModule importado
- FormBuilder para construcción
- Validaciones (required, email, minLength, custom)
- Feedback visual de errores con Bootstrap
- Manejo de submit con loading state
- OnPush strategy
```

### 8. Implementar interceptors

**Prompt:**

```
Crea un HTTP interceptor de Angular 19 para [propósito] que:
- Use la nueva API funcional de interceptors
- Maneje errores HTTP de forma global
- Agregue headers de autenticación si es necesario
- Log de requests en desarrollo
```

### 9. Crear pipes personalizados

**Prompt:**

```
Crea un pipe standalone de Angular para [transformación] que:
- Implemente PureTransform
- Maneje valores null/undefined
- Tenga tests unitarios
- Use en shared/pipes
```

### 10. Documentar código

**Prompt:**

```
Agrega JSDoc completo a este archivo con:
- Descripción del propósito
- @param para cada parámetro
- @returns para valores de retorno
- @throws para errores posibles
- @example con casos de uso
```

## 🎨 Patrones de código del proyecto

### Estructura de servicios

```typescript
import { Injectable } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { getCollectionRef, createDocument, getDocumentById, updateDocument, deleteDocument, serializeDates, handleFirestoreError } from "../core/data/firestore.utils";

@Injectable({
  providedIn: "root",
})
export class MiServicio {
  private readonly COLLECTION_PATH = "mi_coleccion";
  private collection;

  constructor(private firestore: Firestore) {
    this.collection = getCollectionRef(this.firestore, this.COLLECTION_PATH);
  }

  async crear(datos: Omit<MiModelo, "id">): Promise<string> {
    try {
      const serialized = serializeDates(datos, ["fechaCampo"]);
      return await createDocument(this.collection, serialized);
    } catch (error) {
      handleFirestoreError(error, "crear registro");
    }
  }

  // Más métodos...
}
```

### Estructura de componentes

```typescript
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";

@Component({
  selector: "app-mi-componente",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./mi-componente.component.html",
  styleUrls: ["./mi-componente.component.css"],
})
export class MiComponente {
  items$: Observable<Item[]>;

  constructor(private servicio: MiServicio) {
    this.items$ = this.servicio.obtenerItems();
  }

  trackByFn(index: number, item: Item): string {
    return item.id;
  }
}
```

### Template con async pipe

```html
<div *ngIf="items$ | async as items; else loading">
  <div *ngFor="let item of items; trackBy: trackByFn">{{ item.nombre }}</div>
</div>
<ng-template #loading>
  <div>Cargando...</div>
</ng-template>
```

## 🚨 Reglas importantes

### ✅ Hacer

- Usar `standalone: true` en todos los componentes nuevos
- Importar `CommonModule` cuando uses pipes/directivas comunes
- Implementar `OnPush` en componentes de presentación
- Usar `async pipe` para observables
- Agregar `trackBy` en todos los `*ngFor`
- Manejar errores con `handleFirestoreError()`
- Documentar funciones públicas con JSDoc
- Crear tests para nuevo código

### ❌ Evitar

- Crear NgModules (proyecto usa standalone)
- Suscripciones sin unsubscribe (usa async pipe)
- Lógica de negocio en componentes (usa servicios)
- Inyectar servicios en servicios sin `providedIn: 'root'`
- Hardcodear URLs o rutas de Firestore
- Exponer claves privadas en el cliente
- Hacer `console.log` sin guard de desarrollo

## 📝 Comentarios TODO efectivos

Use estos formatos para que Copilot entienda mejor:

```typescript
// TODO: [REFACTOR] Convertir a OnPush y async pipe
// TODO: [FEATURE] Agregar paginación a esta lista
// TODO: [BUG] Manejar error cuando el curso no existe
// TODO: [TEST] Agregar tests unitarios
// TODO: [COPILOT] Implementar filtro por fecha usando RxJS operators
// TODO: [PERFORMANCE] Implementar virtual scrolling
// TODO: [SECURITY] Validar permisos del usuario antes de eliminar
```

## 🔧 Configuración recomendada de Copilot

1. **Habilitar sugerencias en línea**: Sí
2. **Sugerencias automáticas**: Sí
3. **Lenguajes activos**: TypeScript, HTML, CSS, JSON
4. **Contexto de workspace**: Habilitado

## 📚 Recursos de referencia

- [Angular 19 Docs](https://angular.dev)
- [AngularFire](https://github.com/angular/angularfire)
- [RxJS](https://rxjs.dev)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3)

## 💡 Tips avanzados

### Chat de Copilot para arquitectura

Use el chat cuando necesite:

- Planificar estructura de features completas
- Decidir patrones de estado
- Revisar arquitectura de servicios
- Generar diagramas de flujo

### Copilot para refactors masivos

```
Prompt en chat:
"Necesito refactorizar todos los servicios en app/services/ para que usen las utilidades de core/data/firestore.utils. Dame un plan paso a paso y genera el código para cada servicio uno por uno."
```

### Copilot para tests

```
Prompt en chat:
"Genera una suite de tests completa para este servicio. Incluye:
1. Setup con mocks de Firestore
2. Tests de CRUD exitosos
3. Tests de manejo de errores
4. Tests de edge cases
5. Cleanup en afterEach"
```
