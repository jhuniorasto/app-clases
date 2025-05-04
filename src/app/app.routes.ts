import { Routes } from '@angular/router';
import { LoginComponent } from '../app/components/auth/Sing in/login.component'; // importa tu componente Login
import { HomeComponent } from './components/home/home.component'; // importa tu componente Home

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
