import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CursoService } from '../../../services/curso.service';
import { Curso } from '../../../models/curso.model';
import Swal from 'sweetalert2';

interface Horario {
  id?: string;
  cursoId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  docenteUid?: string;
}

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.css',
})
export class GestionHorariosComponent implements OnInit {
  horarios: Horario[] = [];
  cursos: Curso[] = [];
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  horarioEditando: Horario | null = null;
  cursoSeleccionado: string = '';

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  formularioHorario: FormGroup;

  constructor(
    private adminService: AdminService,
    private cursoService: CursoService,
    private fb: FormBuilder
  ) {
    this.formularioHorario = this.fb.group({
      cursoId: ['', Validators.required],
      dia: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarCursos();
  }

  async cargarCursos(): Promise<void> {
    try {
      this.cargando = true;
      this.cursoService.obtenerCursos().subscribe((cursos) => {
        this.cursos = cursos;
        this.cargando = false;
      });
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      Swal.fire('Error', 'No se pudieron cargar los cursos', 'error');
    }
  }

  async cargarHorarios(): Promise<void> {
    if (!this.cursoSeleccionado) {
      this.horarios = [];
      return;
    }

    try {
      this.cargando = true;
      this.horarios = await this.adminService.obtenerHorariosDeCurso(
        this.cursoSeleccionado
      );
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
    } finally {
      this.cargando = false;
    }
  }

  onCursoChange(): void {
    this.cargarHorarios();
  }

  abrirFormularioNuevo(): void {
    this.horarioEditando = null;
    this.formularioHorario.reset({
      cursoId: this.cursoSeleccionado,
    });
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(horario: Horario): void {
    this.horarioEditando = horario;
    this.formularioHorario.patchValue(horario);
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formularioHorario.reset();
    this.horarioEditando = null;
  }

  async guardarHorario(): Promise<void> {
    if (this.formularioHorario.invalid) {
      Swal.fire(
        'Error',
        'Por favor completa todos los campos requeridos',
        'error'
      );
      return;
    }

    try {
      const datos = this.formularioHorario.value;

      if (this.horarioEditando?.id) {
        // Actualizar horario existente
        await this.adminService.actualizarHorario(
          this.horarioEditando.id,
          datos
        );
        Swal.fire('Éxito', 'Horario actualizado correctamente', 'success');
      } else {
        // Crear nuevo horario
        await this.adminService.crearHorario(datos);
        Swal.fire('Éxito', 'Horario creado correctamente', 'success');
      }

      this.cerrarFormulario();
      await this.cargarHorarios();
    } catch (error: any) {
      console.error('Error al guardar horario:', error);
      Swal.fire(
        'Error',
        error.message || 'No se pudo guardar el horario',
        'error'
      );
    }
  }

  async eliminarHorario(horario: Horario): Promise<void> {
    if (!horario.id) return;

    const resultado = await Swal.fire({
      title: '¿Eliminar horario?',
      text: `¿Estás seguro de que deseas eliminar este horario del ${horario.dia}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (resultado.isConfirmed) {
      try {
        await this.adminService.eliminarHorario(horario.id);
        Swal.fire('Éxito', 'Horario eliminado', 'success');
        await this.cargarHorarios();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el horario', 'error');
      }
    }
  }

  getNombreCurso(cursoId: string): string {
    const curso = this.cursos.find((c) => c.id === cursoId);
    return curso ? curso.titulo : 'Desconocido';
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    try {
      const inicio = new Date(`2000-01-01 ${horaInicio}`);
      const fin = new Date(`2000-01-01 ${horaFin}`);
      const diferencia = fin.getTime() - inicio.getTime();
      const minutos = Math.round(diferencia / 60000);
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;

      if (horas === 0) {
        return `${mins}m`;
      } else if (mins === 0) {
        return `${horas}h`;
      } else {
        return `${horas}h ${mins}m`;
      }
    } catch {
      return '-';
    }
  }
}
