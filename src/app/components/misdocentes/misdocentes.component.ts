import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service'; // ajusta la ruta si es necesario
import { Usuario } from '../../models/usuario.model'; // ajusta la ruta si es necesario

@Component({
  selector: 'app-misdocentes',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './misdocentes.component.html',
  styleUrl: './misdocentes.component.css',
})
export class MisdocentesComponent {
  profesores: Usuario[] = [];

  imagenPorDefecto: string =
    'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

  mostrarModal = false;

  profesorForm = {
    nombre: '',
    edad: null,
    curso: '',
  };

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  async ngOnInit() {
    await this.obtenerProfesores();
  }

  async obtenerProfesores() {
    try {
      this.profesores = await this.usuarioService.obtenerProfesores();
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  }

  agregarProfesor() {
    this.mostrarModal = true;
  }

  confirmarAgregarProfesor() {
    alert('Esta acción ahora debería hacerse desde el panel de usuarios.');
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.profesorForm = { nombre: '', edad: null, curso: '' };
  }

  modificarProfesor(profesor: Usuario) {
    alert('Función deshabilitada. Edita desde el módulo de usuarios.');
  }

  verCV() {
    alert('Función deshabilitada. Elimina desde el módulo de usuarios.');
  }

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
