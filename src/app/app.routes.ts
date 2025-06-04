import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/signin/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { LayoutComponent } from './components/layout/layout.component';
import { RoleGuard } from './guards/has-role.guard';
// Todas las rutas están protegidas con lazy loading + canLoad si es necesario
export const routes: Routes = [
  // Rutas públicas
  { path: 'signin', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Rutas con layout general
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./components/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['docente'] },
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./components/cursos/cursos.component').then(
            (m) => m.CursosComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['docente'] },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/myperfil/myperfil.component').then(
            (m) => m.MyperfilComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante', 'docente'] }, // ambos roles pueden acceder
      },
      {
        path: 'miscursos',
        loadComponent: () =>
          import('./components/miscursos/miscursos.component').then(
            (m) => m.MiscursosComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],

        data: { roles: ['estudiante'] },
      },
      {
        path: 'misdocentes',
        loadComponent: () =>
          import('./components/misdocentes/misdocentes.component').then(
            (m) => m.MisdocentesComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],

        data: { roles: ['estudiante'] },
      },
      {
        path: 'detalle-curso/:id',
        loadComponent: () =>
          import('./components/clases/clases.component').then(
            (m) => m.ClasesComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['docente', 'estudiante'] },
      },
      {
        path: 'detalle-clases/:id',
        loadComponent: () =>
          import('./components/misclases/misclases.component').then(
            (m) => m.MisclasesComponent
          ),
        canActivate: [AuthGuard, RoleGuard],
        canLoad: [AuthGuard, RoleGuard],
        data: { roles: ['estudiante'] },
      },
    ],
  },

  // Ruta comodín
  { path: '**', redirectTo: '' },
];
