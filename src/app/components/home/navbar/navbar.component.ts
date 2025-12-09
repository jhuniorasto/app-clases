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
  isEstudiante: boolean = false;
  isAdmin: boolean = false;
  isDocente: boolean = false;
  constructor(private authService: AuthService, private router: Router) {
    this.usuario$ = this.authService.usuario$;
  }

  ngOnInit(): void {
    this.checkearRol();
  }

  async checkearRol(): Promise<void> {
    const user = await this.authService.getUserData();

    if (user) {
      this.isEstudiante = user.rol === 'estudiante';
      this.isAdmin = user.rol === 'admin';
      this.isDocente = user.rol === 'docente';
    } else {
      this.isEstudiante = false;
      this.isAdmin = false;
      this.isDocente = false;
    }
  }

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToProfesores(): void {
    this.router.navigate(['/docente']);
  }

  onRedirectToCursos(): void {
    this.router.navigate(['/cursos']);
  }

  onRedirectToMisCursos(): void {
    this.router.navigate(['/miscursos']);
  }

  onRedirectToMisClases(): void {
    this.router.navigate(['/misclases']);
  }

  onRedirectToMisDocentes(): void {
    console.log('Navegando a misdocentes...');
    this.router.navigate(['/misdocentes']);
  }

  onRedirectToHome(): void {
    this.router.navigate(['/home']);
  }

  onRedirectToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  onRedirectToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/signin']);
    });
  }
}
