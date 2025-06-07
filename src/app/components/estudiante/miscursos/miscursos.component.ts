import { Component } from '@angular/core';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso.service';
import { ClaseService } from '../../../services/clase.service';
import { ProgresoClaseService } from '../../../services/progreso-clase.service';
import { AuthService } from '../../../services/auth.service';
import { InscripcionService } from '../../../services/inscripcion.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-miscursos',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './miscursos.component.html',
  styleUrl: './miscursos.component.css',
})
export class MiscursosComponent {
  cursos: Curso[] = [];
  cursoSeleccionado: Curso | null = null;
  mostrarModal = false;
  isEstudiante: boolean = false;

  cursosInscritos: Curso[] = [];
  tieneInscripciones: boolean = false;
  mostrarCursosInscritos: boolean = false;

  imagenPorDefecto: string =
    'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

  progresosCursos: { [key: string]: number } = {};

  constructor(
    private cursoService: CursoService,
    private claseService: ClaseService,
    private progresoClaseService: ProgresoClaseService,
    private authService: AuthService,
    private inscripcionService: InscripcionService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.checkearRol();
    await this.cargarCursosInscritos();
  }

  async checkearRol(): Promise<void> {
    const user = await this.authService.getUserData();

    if (user) {
      this.isEstudiante = user.rol === 'estudiante';
    } else {
      this.isEstudiante = false;
    }
  }

  async cargarCursos(): Promise<void> {
    const estudianteUid = await this.authService.getUserId();

    // Primero, obtenemos las inscripciones del usuario
    let cursosInscritosIds: string[] = [];
    if (estudianteUid) {
      const inscripciones =
        await this.inscripcionService.obtenerInscripcionesPorEstudiante(
          estudianteUid
        );
      cursosInscritosIds = inscripciones
        ? inscripciones.map((insc: any) => insc.cursoId)
        : [];
    }

    // Ahora obtenemos todos los cursos y filtramos los que NO están inscritos
    this.cursoService.obtenerCursos().subscribe(async (cursos) => {
      this.cursos = cursos.filter(
        (curso) => !cursosInscritosIds.includes(curso.id)
      );
      // Calcula el progreso solo para los cursos no inscritos (opcional)
    });
  }

  async cargarCursosInscritos(): Promise<void> {
    const estudianteUid = await this.authService.getUserId();
    if (!estudianteUid) {
      this.cursosInscritos = [];
      this.tieneInscripciones = false;
      return;
    }
    const inscripciones =
      await this.inscripcionService.obtenerInscripcionesPorEstudiante(
        estudianteUid
      );
    if (!inscripciones || inscripciones.length === 0) {
      this.cursosInscritos = [];
      this.tieneInscripciones = false;
      return;
    }
    this.tieneInscripciones = true;
    // Obtener los cursos a partir de las inscripciones
    const cursos = await Promise.all(
      inscripciones.map(async (insc: any) => {
        return await this.cursoService.obtenerCursoPorId(insc.cursoId);
      })
    );
    this.cursosInscritos = cursos.filter((c) => !!c); // Filtra nulos
    this.calcularProgresosCursosInscritos();
  }

  async calcularProgresosCursosInscritos() {
    const estudianteUid = await this.authService.getUserId();
    for (const curso of this.cursosInscritos) {
      const clases = await firstValueFrom(
        this.claseService.obtenerClasesPorCurso(curso.id)
      );
      console.log('Clases del curso', curso.titulo, clases);

      const progresos =
        await this.progresoClaseService.obtenerProgresosPorCursoYEstudiante(
          curso.id,
          estudianteUid!
        );
      console.log('Progresos del curso', curso.titulo, progresos);

      const totalClases = clases.length;
      const completadas = progresos.filter((p: any) => p.completado).length;
      const porcentaje =
        totalClases > 0 ? Math.round((completadas / totalClases) * 100) : 0;
      this.progresosCursos[curso.id] = porcentaje;
    }
  }

  verTodosLosCursos() {
    this.mostrarCursosInscritos = false;
    this.cargarCursos();
  }

  verCursosInscritos() {
    this.mostrarCursosInscritos = true;
    this.cargarCursosInscritos();
  }

  progreso(porcentaje: number): string {
    const circunferencia = 2 * Math.PI * 16;
    return `${circunferencia}`;
  }

  offset(porcentaje: number): number {
    const circunferencia = 2 * Math.PI * 16;
    return circunferencia * (1 - porcentaje / 100);
  }
}
