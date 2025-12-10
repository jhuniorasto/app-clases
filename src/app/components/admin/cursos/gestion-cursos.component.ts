import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../../core/models/curso.model';
import { CursoService } from '../../../core/services/curso.service';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-gestion-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-cursos.component.html',
  styleUrls: ['./gestion-cursos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionCursosComponent {
  mostrarFormulario = false;
  cursoEditando: Curso | null = null;

  cursos$: Observable<Curso[]>;

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

  constructor(private cursoService: CursoService) {
    this.cursos$ = this.cargarCursos();
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
  }

  async guardarCurso(): Promise<void> {
    // Validaciones
    if (!this.nuevoCurso.titulo || !this.nuevoCurso.titulo.trim()) {
      Swal.fire('Error', 'El título del curso es requerido', 'error');
      return;
    }

    if (!this.nuevoCurso.categoria) {
      Swal.fire('Error', 'La categoría del curso es requerida', 'error');
      return;
    }

    if (!this.nuevoCurso.duracion || this.nuevoCurso.duracion <= 0) {
      Swal.fire('Error', 'La duración debe ser mayor a 0 horas', 'error');
      return;
    }

    try {
      if (this.cursoEditando) {
        // Actualizar curso existente
        await this.cursoService.actualizarCurso(
          this.cursoEditando.id,
          this.nuevoCurso as any
        );
        Swal.fire('✅ Éxito', 'Curso actualizado correctamente', 'success');
      } else {
        // Crear nuevo curso
        await this.cursoService.crearCurso(this.nuevoCurso as any);
        Swal.fire('✅ Éxito', 'Curso creado correctamente', 'success');
      }
      this.cerrarFormulario();
    } catch (error: any) {
      console.error('Error guardando curso:', error);
      Swal.fire(
        'Error',
        error.message || 'No se pudo guardar el curso',
        'error'
      );
    }
  }

  async eliminarCurso(id: string): Promise<void> {
    const resultado = await Swal.fire({
      title: '🗑️ ¿Eliminar curso?',
      text: 'Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Sí, eliminar',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#f5576c',
    });

    if (resultado.isConfirmed) {
      try {
        await this.cursoService.eliminarCurso(id);
        Swal.fire('✅ Éxito', 'Curso eliminado correctamente', 'success');
      } catch (error: any) {
        console.error('Error eliminando curso:', error);
        Swal.fire(
          'Error',
          error.message || 'No se pudo eliminar el curso',
          'error'
        );
      }
    }
  }

  trackById(index: number, curso: Curso): string {
    return curso.id;
  }

  private cargarCursos(): Observable<Curso[]> {
    return this.cursoService.obtenerCursos().pipe(
      map((cursos) =>
        cursos.map((curso) => ({
          ...curso,
          fechaCreacion:
            curso.fechaCreacion instanceof Timestamp
              ? curso.fechaCreacion.toDate()
              : curso.fechaCreacion,
        }))
      ),
      catchError((error) => {
        console.error('Error al cargar cursos:', error);
        Swal.fire('Error', 'No se pudieron cargar los cursos', 'error');
        return of([] as Curso[]);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
