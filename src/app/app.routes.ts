import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/signin/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { LayoutComponent } from './components/layout/layout.component'; // Componente de layout general
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { CursosComponent } from './components/cursos/cursos.component';

export const routes: Routes = [
  // Rutas públicas
  { path: 'signin', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Rutas con layout general
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'cursos', component: CursosComponent },
      // Aquí puedes agregar más rutas internas
    ],
  },

  // Ruta comodín para redireccionar en caso de no encontrar la ruta
  { path: '**', redirectTo: '' },
];
