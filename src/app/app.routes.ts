import { AdminComponent } from './components/docente/profesores/admin.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/signin/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { RoleGuard } from './guards/has-role.guard';
// Todas las rutas están protegidas con lazy loading + canLoad si es necesario
export const routes: Routes = [
  // Rutas públicas
  { path: 'signin', component: LoginComponent },
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  // Rutas con layout general
  {
    path: '',
    component: LayoutComponent,
    children: [
      /* {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (m) => m.HomeComponent
          ),
      }, */
      {
        path: 'admin',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './components/admin/dashboard/admin-dashboard.component'
              ).then((m) => m.AdminDashboardComponent),
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'usuarios',
            loadComponent: () =>
              import(
                './components/admin/usuarios/gestion-usuarios.component'
              ).then((m) => m.GestionUsuariosComponent),
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'inscripciones',
            loadComponent: () =>
              import(
                './components/admin/inscripciones/gestion-inscripciones.component'
              ).then((m) => m.GestionInscripcionesComponent),
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'horarios',
            loadComponent: () =>
              import(
                './components/admin/horarios/gestion-horarios.component'
              ).then((m) => m.GestionHorariosComponent),
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: 'cursos',
            loadComponent: () =>
              import('./components/admin/cursos/gestion-cursos.component').then(
                (m) => m.GestionCursosComponent
              ),
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },
      {
        path: 'docente',
        loadComponent: () =>
          import('./components/docente/profesores/admin.component').then(
            (m) => m.AdminComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['docente', 'admin', 'estudiante'] },
      },
      {
        path: 'cursos',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/docente/cursos/cursos.component').then(
                (m) => m.CursosComponent
              ),
            canActivate: [AuthGuard, RoleGuard],
            canLoad: [AuthGuard, RoleGuard],
            data: { roles: ['docente', 'admin', 'estudiante'] },
          },
          {
            path: 'detalle-clases/:id',
            loadComponent: () =>
              import(
                './components/estudiante/misclases/misclases.component'
              ).then((m) => m.MisclasesComponent),
            canActivate: [AuthGuard, RoleGuard],
            canLoad: [AuthGuard, RoleGuard],
            data: { roles: ['estudiante', 'admin'] },
          },
          {
            path: 'detalle-curso/:id',
            loadComponent: () =>
              import('./components/docente/clases/clases.component').then(
                (m) => m.ClasesComponent
              ),
            canActivate: [AuthGuard, RoleGuard],
            canLoad: [AuthGuard, RoleGuard],
            data: { roles: ['docente', 'estudiante', 'admin'] },
          },
        ],
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/myperfil/myperfil.component').then(
            (m) => m.MyperfilComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante', 'docente', 'admin'] }, // ambos roles pueden acceder
      },
      {
        path: 'miscursos',
        loadComponent: () =>
          import('./components/estudiante/miscursos/miscursos.component').then(
            (m) => m.MiscursosComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],

        data: { roles: ['estudiante'] },
      },
      {
        path: 'misdocentes',
        loadComponent: () =>
          import(
            './components/estudiante/misdocentes/misdocentes.component'
          ).then((m) => m.MisdocentesComponent),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],

        data: { roles: ['estudiante'] },
      },
    ],
  },
];
