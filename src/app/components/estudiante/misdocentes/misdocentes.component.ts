import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service'; // ajusta la ruta si es necesario
import { Usuario } from '../../../models/usuario.model'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';

@Component({
  selector: 'app-misdocentes',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './misdocentes.component.html',
  styleUrl: './misdocentes.component.css',
})
export class MisdocentesComponent {
  profesores: Usuario[] = [];
  profesoresFiltrados: Usuario[] = [];

  imagenPorDefecto: string =
    'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

  mostrarModal = false;
  filtroNombre: string = '';
  rol: string = '';

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  async ngOnInit() {
    await this.obtenerRolUsuario();
    await this.obtenerProfesores();
  }

  async obtenerRolUsuario() {
    try {
      const usuario = await this.usuarioService.obtenerUsuarioActual();
      this.rol = usuario?.rol || '';
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
    }
  }

  async obtenerProfesores() {
    try {
      this.profesores = await this.usuarioService.obtenerProfesores();
      this.profesoresFiltrados = [...this.profesores];
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  }

  // Método principal que se llama desde el botón "Buscar Docente"
  buscarDocente() {
    if (this.rol === 'estudiante') {
      this.mostrarModal = true;
      this.filtroNombre = '';
      this.profesoresFiltrados = [...this.profesores];
    } else {
      alert('Solo los estudiantes pueden usar esta funcionalidad.');
    }
  }

  // Filtrar profesores por nombre
  filtrarPorNombre() {
    const texto = this.filtroNombre.trim().toLowerCase();
    if (texto === '') {
      this.profesoresFiltrados = [...this.profesores];
    } else {
      this.profesoresFiltrados = this.profesores.filter((profesor) =>
        profesor.nombre.toLowerCase().includes(texto)
      );
    }
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

  // Aplica el filtro, cierra el modal
  aplicarFiltro() {
    const texto = this.filtroNombre.trim().toLowerCase();

    if (texto === '') {
      alert('Por favor escribe un nombre para filtrar.');
      return;
    }

    this.profesoresFiltrados = this.profesores.filter((profesor) =>
      profesor.nombre.toLowerCase().includes(texto)
    );
    this.mostrarModal = false;
  }

  // Limpia el filtro y muestra todos los profesores
  limpiarFiltro() {
    this.filtroNombre = '';
    this.profesoresFiltrados = [...this.profesores];
    this.mostrarModal = false;
  }

  // Solo cierra el modal sin cambiar la lista
  cerrarModal() {
    this.mostrarModal = false;
  }

  verTodosLosProfesores() {
    const sinFiltro = this.filtroNombre.trim() === '';
    const yaMostrandoTodo =
      this.profesoresFiltrados.length === this.profesores.length;

    if (sinFiltro && yaMostrandoTodo) {
      // Mensaje elegante con SweetAlert
      Swal.fire({
        icon: 'info',
        title: 'Vista completa',
        text: 'Actualmente estás viendo todos los profesores disponibles.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Si había filtro, se limpia y se muestra todo
    this.filtroNombre = '';
    this.profesoresFiltrados = [...this.profesores];
  }
}
