import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private authService: AuthService, private router: Router) {}
  courses = [
    {
      id: 'curso1',
      title: 'Introducción a Angular',
      description: 'Aprende los fundamentos de Angular y desarrolla aplicaciones web modernas.',
      category: 'Frontend',
      imageUrl: 'https://via.placeholder.com/400x200?text=Angular+Course'
    },
    {
      id: 'curso2',
      title: 'Firebase para Web',
      description: 'Conecta tus apps con Firebase y aprende Firestore, Auth y Storage.',
      category: 'Backend',
      imageUrl: 'https://via.placeholder.com/400x200?text=Firebase+Course'
    },
    // Puedes agregar más cursos simulados aquí...
  ];

  logout() :void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  ngOnInit() {
    // Simulación de carga de datos
    // En una app real, obtendrás esto desde un servicio conectado a Firebase
  }
}
