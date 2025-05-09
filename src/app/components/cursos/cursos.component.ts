import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from './../../models/curso.model';
import { CursoService } from './../../services/curso.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cursos',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css'],
})
export class CursosComponent {
  cursos: Curso[] = [];
  cursoSeleccionado: Curso | null = null;
  mostrarModal = false;

  imagenPorDefecto: string =
    'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

  // Datos para el formulario (crear/editar)
  nuevoCurso: Partial<Curso> = {
    titulo: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    creadoPorUid: '', // deberías llenar esto con el UID actual del usuario autenticado
    fechaCreacion: new Date(),
  };

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.cancelarEdicion();
    this.mostrarModal = false;
  }

  // Confirma la acción dependiendo de si es agregar o modificar curso
  confirmarAgregarCurso(): void {
    if (this.cursoSeleccionado) {
      this.modificarCurso();
    } else {
      this.agregarCurso();
    }
    this.cerrarModal();
  }

  cargarCursos(): void {
    this.cursoService.obtenerCursos().subscribe((cursos) => {
      this.cursos = cursos;
    });
  }

  seleccionarCurso(curso: Curso): void {
    this.cursoSeleccionado = curso;
    this.nuevoCurso = { ...curso };
    this.abrirModal(); // Abre el modal con los datos del curso
  }

  cancelarEdicion(): void {
    this.cursoSeleccionado = null;
    this.nuevoCurso = {
      titulo: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      creadoPorUid: '',
      fechaCreacion: new Date(),
    };
  }

  async agregarCurso(): Promise<void> {
    try {
      if (
        this.nuevoCurso.titulo &&
        this.nuevoCurso.descripcion &&
        this.nuevoCurso.categoria &&
        this.nuevoCurso.imagenUrl &&
        this.nuevoCurso.creadoPorUid &&
        this.nuevoCurso.fechaCreacion
      ) {
        // Intentamos agregar el curso
        await this.cursoService.crearCurso(
          this.nuevoCurso as Omit<Curso, 'id'>
        );
        this.cargarCursos();

        // Mostrar mensaje de éxito si el curso fue agregado correctamente
        Swal.fire({
          icon: 'success',
          title: '¡Curso agregado!',
          text: `El curso ha sido agregado exitosamente.`,
          confirmButtonText: 'Aceptar',
        });
      } else {
        // Mostrar mensaje de advertencia si los campos no están completos
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: `Por favor, completa todos los campos del curso.`,
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error al agregar curso:', error);

      // Mostrar mensaje de error si ocurre algún problema al agregar el curso
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar curso',
        text: `Hubo un problema al agregar el curso. Intenta nuevamente.`,
        confirmButtonText: 'Aceptar',
      });
    }
  }

  async modificarCurso(): Promise<void> {
    if (!this.cursoSeleccionado?.id) return;

    const { titulo, descripcion, categoria, imagenUrl, fechaCreacion } =
      this.nuevoCurso;

    try {
      await this.cursoService.actualizarCurso(this.cursoSeleccionado.id, {
        titulo,
        descripcion,
        categoria,
        imagenUrl,
      });

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Curso modificado!',
        text: 'Los datos del curso fueron actualizados correctamente.',
        confirmButtonText: 'Aceptar',
      });

      // Actualizar la vista solo después de cerrar el mensaje
      this.cargarCursos();
    } catch (error) {
      console.error('Error al actualizar curso:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error al modificar curso',
        text: 'Ocurrió un problema al intentar modificar el curso.',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  async eliminarCurso(cursoId: string): Promise<void> {
    // Pregunta al usuario si está seguro de eliminar el curso
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esto eliminará el curso permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'Cancelar',
    });

    // Si el usuario confirma, procede a eliminar el curso
    if (result.isConfirmed) {
      try {
        await this.cursoService.eliminarCurso(cursoId);
        this.cargarCursos();
        // Muestra un mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Curso eliminado!',
          text: `El curso ha sido eliminado con éxito.`,
          confirmButtonText: 'Aceptar',
        });
      } catch (error) {
        console.error('Error al eliminar el curso:', error);

        // Muestra un mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: `Hubo un problema al eliminar el curso. Intenta nuevamente.`,
          confirmButtonText: 'Aceptar',
        });
      }
    }
  }
}
