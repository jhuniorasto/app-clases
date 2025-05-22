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
    } else {
      this.isEstudiante = false;
    }
  }

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToProfesores(): void {
    this.router.navigate(['/admin']);
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

  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/home']);
    });
  }
}
