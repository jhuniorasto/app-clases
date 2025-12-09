import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-cursos.component.html',
  styleUrl: './gestion-cursos.component.css',
})
export class GestionCursosComponent implements OnInit {
  cursos: Curso[] = [];
  cargando = true;
  mostrarFormulario = false;
  cursoEditando: Curso | null = null;

  nuevoCurso: Partial<Curso> = {
    titulo: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    creadoPorUid: '',
    fechaCreacion: new Date(),
    duracion: 0,
    progresoEstudiante: 0,
  };

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.cursoService.obtenerCursos().subscribe((c) => {
      this.cursos = c;
      this.cargando = false;
    });
  }

  abrirFormularioNuevo(): void {
    this.cursoEditando = null;
    this.nuevoCurso = {
      titulo: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      creadoPorUid: '',
      fechaCreacion: new Date(),
      duracion: 0,
      progresoEstudiante: 0,
    };
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(curso: Curso): void {
    this.cursoEditando = curso;
    this.nuevoCurso = { ...curso };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.cursoEditando = null;
  }

  async guardarCurso(): Promise<void> {
    try {
      if (this.cursoEditando) {
        await this.cursoService.actualizarCurso(
          this.cursoEditando.id,
          this.nuevoCurso as any
        );
        Swal.fire('Éxito', 'Curso actualizado', 'success');
      } else {
        await this.cursoService.crearCurso(this.nuevoCurso as any);
        Swal.fire('Éxito', 'Curso creado', 'success');
      }
      this.cerrarFormulario();
    } catch (error) {
      console.error('Error guardando curso', error);
      Swal.fire('Error', 'No se pudo guardar el curso', 'error');
    }
  }

  async eliminarCurso(id: string): Promise<void> {
    const res = await Swal.fire({
      title: 'Eliminar curso',
      text: '¿Estás seguro? Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    });

    if (res.isConfirmed) {
      try {
        await this.cursoService.eliminarCurso(id);
        Swal.fire('Eliminado', 'Curso eliminado correctamente', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el curso', 'error');
      }
    }
  }
}
