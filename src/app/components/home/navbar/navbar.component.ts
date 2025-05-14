import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
   usuario$: Observable<User | null>;

  constructor(private authService: AuthService , private router: Router) {
    this.usuario$ = this.authService.usuario$;
  }

  ngOnInit(): void {}

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToProfesores(): void {
    this.router.navigate(['/admin']);
  }

  onRedirectToCursos(): void {
    this.router.navigate(['/cursos']);
  }

  onRedirectToHome(): void {
    this.router.navigate(['/home']);
  }

  onRedirectToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
  });
  }
}
