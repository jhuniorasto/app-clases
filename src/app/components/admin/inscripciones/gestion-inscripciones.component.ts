import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-inscripciones.component.html',
  styleUrls: ['./gestion-inscripciones.component.css'],
})
export class GestionInscripcionesComponent implements OnInit {
  estudiantes: any[] = [];
  cursos: any[] = [];
  inscripciones: any[] = [];
  inscripcionesOriginales: any[] = [];

  seleccionEstudiante: string = '';
  seleccionCurso: string = '';

  // filtros
  filtroEstudiante: string = '';
  filtroCurso: string = '';
  buscarEstudiante: string = '';

  cargando: boolean = false;

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    try {
      this.cargando = true;
      this.estudiantes = await this.adminService.obtenerEstudiantes();
      this.cursos = await this.adminService.obtenerCursos();
      this.inscripcionesOriginales =
        await this.adminService.obtenerInscripciones();
      this.inscripciones = [...this.inscripcionesOriginales];
    } catch (error) {
      console.error('Error cargando datos de inscripciones', error);
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Aplica los filtros seleccionados sobre las inscripciones
   */
  aplicarFiltros(): void {
    let resultado = [...this.inscripcionesOriginales];

    if (this.filtroCurso) {
      resultado = resultado.filter((i) => i.cursoId === this.filtroCurso);
    }

    if (this.filtroEstudiante) {
      resultado = resultado.filter(
        (i) => i.estudianteUid === this.filtroEstudiante
      );
    }

    if (this.buscarEstudiante && this.buscarEstudiante.trim()) {
      const term = this.buscarEstudiante.toLowerCase();
      resultado = resultado.filter((i) => {
        const nombre = i.estudiante?.nombre || '';
        const email = i.estudiante?.email || '';
        return (
          nombre.toLowerCase().includes(term) ||
          email.toLowerCase().includes(term)
        );
      });
    }

    this.inscripciones = resultado;
  }

  limpiarFiltros(): void {
    this.filtroCurso = '';
    this.filtroEstudiante = '';
    this.buscarEstudiante = '';
    this.inscripciones = [...this.inscripcionesOriginales];
  }

  /**
   * Cuenta estudiantes inscritos actualmente en un curso (según datos cargados)
   */
  contarEstudiantesPorCurso(cursoId: string): number {
    return this.inscripcionesOriginales.filter((i) => i.cursoId === cursoId)
      .length;
  }

  /**
   * Cuenta cuántas inscripciones tiene un estudiante
   */
  contarInscripcionesEstudiante(estudianteUid: string): number {
    return this.inscripcionesOriginales.filter(
      (i) => i.estudianteUid === estudianteUid
    ).length;
  }

  /**
   * Lista estudiantes que aún no están inscritos en la selección de curso
   */
  obtenerEstudiantesDisponibles(): any[] {
    if (!this.seleccionCurso) return this.estudiantes;
    const inscritos = this.inscripcionesOriginales
      .filter((i) => i.cursoId === this.seleccionCurso)
      .map((i) => i.estudianteUid);
    return this.estudiantes.filter((e) => !inscritos.includes(e.uid));
  }

  async validarInscripcion(): Promise<boolean> {
    if (!this.seleccionEstudiante || !this.seleccionCurso) {
      Swal.fire('Error', 'Seleccione estudiante y curso.', 'warning');
      return false;
    }

    // validar en el servidor si ya existe
    try {
      const existe = await this.adminService.verificarInscripcionExistente(
        this.seleccionEstudiante,
        this.seleccionCurso
      );
      if (existe) {
        const est = this.estudiantes.find(
          (e) => e.uid === this.seleccionEstudiante
        );
        const cur = this.cursos.find((c) => c.id === this.seleccionCurso);
        Swal.fire(
          'Duplicado',
          `${est?.nombre || 'El estudiante'} ya está inscrito en ${
            cur?.titulo || 'este curso'
          }`,
          'warning'
        );
        return false;
      }
    } catch (error) {
      console.error('Error validando inscripción', error);
      // permitir que el admin reintente
      return false;
    }

    return true;
  }

  async inscribir(): Promise<void> {
    const ok = await this.validarInscripcion();
    if (!ok) return;

    try {
      await this.adminService.inscribirEstudianteEnCurso(
        this.seleccionEstudiante,
        this.seleccionCurso
      );
      Swal.fire('Listo', 'Estudiante inscrito correctamente.', 'success');
      await this.cargarDatos();
      this.seleccionEstudiante = '';
      this.seleccionCurso = '';
    } catch (error) {
      console.error('Error al inscribir estudiante', error);
      Swal.fire('Error', 'No se pudo inscribir al estudiante.', 'error');
    }
  }

  async desinscribir(inscripcion: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirmar',
      text: '¿Desea desinscribir a este estudiante?',
      icon: 'warning',
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await this.adminService.desinscribirEstudianteDelCurso(
          inscripcion.estudianteUid,
          inscripcion.cursoId
        );
        Swal.fire('Listo', 'Estudiante desinscrito.', 'success');
        await this.cargarDatos();
      } catch (error) {
        console.error('Error al desinscribir', error);
        Swal.fire('Error', 'No se pudo desinscribir.', 'error');
      }
    }
  }
}
