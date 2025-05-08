import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/signin/login.component'; // importa tu componente Login
import { HomeComponent } from './components/home/home.component'; // importa tu componente Home
import { SignupComponent } from './components/auth/signup/signup.component'; // importa tu componente Signup

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signin', component: LoginComponent },
  { path: 'signup', component: SignupComponent }, // ruta para el componente de registro
  { path: '**', redirectTo: '' }
];
