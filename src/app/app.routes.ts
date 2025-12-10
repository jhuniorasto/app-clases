/**
 * Rutas de la aplicación organizadas por features
 * Usa lazy loading y guards modernos con canMatch
 */

import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards';
import { LoginComponent } from './components/auth/signin/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { NotFoundComponent } from './shared/components/not-found.component';
import { ForbiddenComponent } from './shared/components/forbidden.component';

export const routes: Routes = [
  // ========== Rutas públicas ==========
  {
    path: 'signin',
    component: LoginComponent,
    title: 'Iniciar sesión',
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    title: 'Acceso denegado',
  },
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },

  // ========== Rutas protegidas con layout ==========
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // ===== Feature: Admin =====
      {
        path: 'admin',
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './components/admin/dashboard/admin-dashboard.component'
              ).then((m) => m.AdminDashboardComponent),
            title: 'Panel de administración',
          },
          {
            path: 'usuarios',
            loadComponent: () =>
              import(
                './components/admin/usuarios/gestion-usuarios.component'
              ).then((m) => m.GestionUsuariosComponent),
            title: 'Gestión de usuarios',
          },
          {
            path: 'inscripciones',
            loadComponent: () =>
              import(
                './components/admin/inscripciones/gestion-inscripciones.component'
              ).then((m) => m.GestionInscripcionesComponent),
            title: 'Gestión de inscripciones',
          },
          {
            path: 'horarios',
            loadComponent: () =>
              import(
                './components/admin/horarios/gestion-horarios.component'
              ).then((m) => m.GestionHorariosComponent),
            title: 'Gestión de horarios',
          },
          {
            path: 'cursos',
            loadComponent: () =>
              import('./components/admin/cursos/gestion-cursos.component').then(
                (m) => m.GestionCursosComponent
              ),
            title: 'Gestión de cursos',
          },
        ],
      },

      // ===== Feature: Docente =====
      {
        path: 'docente',
        loadComponent: () =>
          import('./components/docente/profesores/admin.component').then(
            (m) => m.AdminComponent
          ),
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['docente', 'admin', 'estudiante'] },
        title: 'Docentes',
      },

      // ===== Feature: Cursos (compartido) =====
      {
        path: 'cursos',
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['docente', 'admin', 'estudiante'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/docente/cursos/cursos.component').then(
                (m) => m.CursosComponent
              ),
            title: 'Cursos',
          },
          {
            path: 'detalle-clases/:id',
            loadComponent: () =>
              import(
                './components/estudiante/misclases/misclases.component'
              ).then((m) => m.MisclasesComponent),
            canMatch: [AuthGuard, RoleGuard],
            data: { roles: ['estudiante', 'admin'] },
            title: 'Mis clases',
          },
          {
            path: 'detalle-curso/:id',
            loadComponent: () =>
              import('./components/docente/clases/clases.component').then(
                (m) => m.ClasesComponent
              ),
            title: 'Detalle del curso',
          },
        ],
      },

      // ===== Feature: Perfil (compartido) =====
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/myperfil/myperfil.component').then(
            (m) => m.MyperfilComponent
          ),
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante', 'docente', 'admin'] },
        title: 'Mi perfil',
      },

      // ===== Feature: Estudiante =====
      {
        path: 'miscursos',
        loadComponent: () =>
          import('./components/estudiante/miscursos/miscursos.component').then(
            (m) => m.MiscursosComponent
          ),
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante'] },
        title: 'Mis cursos',
      },
      {
        path: 'misdocentes',
        loadComponent: () =>
          import(
            './components/estudiante/misdocentes/misdocentes.component'
          ).then((m) => m.MisdocentesComponent),
        canMatch: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante'] },
        title: 'Mis docentes',
      },
    ],
  },

  // ========== Ruta 404 (debe ir al final) ==========
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada',
  },
];
