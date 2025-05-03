import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [],

})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  loginConGoogle() {
    this.authService.loginConGoogle().then(() => {
      this.router.navigate(['/cursos']);
    });
  }
}
