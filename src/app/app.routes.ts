import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/signin/login.component'; //importa el componente de inicio de sesión  
import { HomeComponent } from './components/home/home.component'; 
import { SignupComponent } from './components/auth/signup/signup.component'; //importa el componente de registro
import { AdminComponent } from './components/admin/admin.component'; 

export const routes: Routes = [
  { path: '', component: HomeComponent },  //http://localhost:4200/ mostrará el componente HomeComponent
  { path: 'signin', component: LoginComponent }, ////http://localhost:4200/signin mostrará el componente LoginComponent
  { path: 'signup', component: SignupComponent }, // ruta para el componente de registro
  { path: 'admin',component: AdminComponent },
  { path: '**', redirectTo: '' } //cualquier ruta desconocida (**) redirige a la home ('')
];
