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

  seleccionEstudiante: string = '';
  seleccionCurso: string = '';

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
      this.inscripciones = await this.adminService.obtenerInscripciones();
    } catch (error) {
      console.error('Error cargando datos de inscripciones', error);
    } finally {
      this.cargando = false;
    }
  }

  async inscribir(): Promise<void> {
    if (!this.seleccionEstudiante || !this.seleccionCurso) {
      Swal.fire('Error', 'Seleccione estudiante y curso.', 'warning');
      return;
    }

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
