import { Usuario } from '../../../models/usuario.model';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso.service';
import { ClaseService } from '../../../services/clase.service';
import { ProgresoClaseService } from '../../../services/progreso-clase.service';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
@Component({
  selector: 'app-cursos',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css'],
})
export class CursosComponent {
  cursos: Curso[] = [];
  cursoSeleccionado: Curso | null = null;
  mostrarModal = false;
  isEstudiante: boolean = false;

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

  constructor(
    private cursoService: CursoService,
    private claseService: ClaseService,
    private progresoClaseService: ProgresoClaseService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const uid = await this.getIdUsuario();
    if (uid) {
      this.getCursosDeUsuario(uid);
    }
    //this.cargarCursos();
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

  async getCursosDeUsuario(uid: string): Promise<void> {
    try {
      const cursos = await this.cursoService
        .obtenerCursosPorUsuario(uid)
        .subscribe((cursos) => (this.cursos = cursos));
    } catch (error) {
      console.error('Error al obtener los cursos del usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cursos del usuario.',
      });
    }
  }

  async getIdUsuario(): Promise<string | null> {
    const usuario = await this.authService.getUserId();
    return usuario;
  }

  async cargarCursos(): Promise<void> {
    this.cursoService.obtenerCursos().subscribe((cursos) => {
      this.cursos = cursos;
    });
    const estudianteUid = await this.authService.getUserId();
    if (estudianteUid) {
      for (const curso of this.cursos) {
        curso.progresoEstudiante = await this.calcularProgresoCurso(
          curso.id,
          estudianteUid
        );
      }
    }
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
        this.mostrarMensajeAdvertenciaSwal(
          'success',
          '¡Curso agregado!',
          'El curso ha sido agregado exitosamente.'
        );
      } else {
        // Mostrar mensaje de advertencia si los campos no están completos
        this.mostrarMensajeAdvertenciaSwal(
          'warning',
          '¡Campos incompletos!',
          'Por favor, completa todos los campos.'
        );
      }
    } catch (error) {
      console.error('Error al agregar curso:', error);
      this.mostrarMensajeAdvertenciaSwal(
        'error',
        'Error al agregar curso',
        'Hubo un problema al agregar el curso. Intenta nuevamente.'
      );
    }
  }

  mostrarMensajeAdvertenciaSwal(
    icon: SweetAlertIcon,
    title: String,
    text: String
  ): void {
    Swal.fire({
      icon: icon,
      title: title,
      text: `${text}`,
      confirmButtonText: 'Aceptar',
    });
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

  async calcularProgresoCurso(
    cursoId: string,
    estudianteUid: string
  ): Promise<number> {
    // Obtener todas las clases del curso
    const clases = await this.claseService
      .obtenerClasesPorCurso(cursoId)
      .toPromise();

    const totalClases = clases ? clases.length : 0;

    if (totalClases === 0) return 0;

    // Obtener todos los progresos del estudiante para esas clases
    const progresos =
      await this.progresoClaseService.obtenerProgresosPorEstudiante(
        estudianteUid
      );

    // Filtrar progresos relacionados a este curso, completados
    const clasesCompletadasYaprobadas = progresos.filter(
      (p) => p.cursoId === cursoId && p.completado
    ).length;

    return (clasesCompletadasYaprobadas / totalClases) * 100;
  }

  // Este método puede recibir un porcentaje y convertirlo en el valor apropiado para el SVG
  progreso(porcentaje: number): string {
    const radio = 16; // valor que tienes en el HTML
    const circunferencia = 2 * Math.PI * radio;
    const progreso = (porcentaje / 100) * circunferencia;
    return `${progreso} ${circunferencia}`;
  }
}
