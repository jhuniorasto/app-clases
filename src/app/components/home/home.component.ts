import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private authService: AuthService, private router: Router) {}

  comentarios: string[] = [];
  nuevoComentario: string = '';

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  agregarComentario() {
    if (this.nuevoComentario.trim()) {
      this.comentarios.push(this.nuevoComentario.trim());
      this.nuevoComentario = '';
    }
  }
  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  ngOnInit() {
    // Simulación de carga de datos
    // En una app real, obtendrás esto desde un servicio conectado a Firebase
  }
}
