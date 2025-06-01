import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../models/curso.model';
import { Clase } from '../../models/clase.model';
import { Usuario } from '../../models/usuario.model';
import { Inscripcion } from '../../models/inscripcion.model';
import { ClaseService } from '../../services/clase.service';
import { InscripcionService } from '../../services/inscripcion.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { ComentariosComponent } from '../comentarios/comentarios.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, FormsModule, ComentariosComponent],
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css',
})
export class ClasesComponent {
  cursoId: string | null = '';
  curso: Curso | null = null;
  clases: Clase[] | null = null;
  usuario: Usuario | null = null;
  mostrarFormulario = false;
  isInscrito = false;
  inscripcion: Inscripcion | null = null;
  isEstudiante = false;
  editandoClase = false;
  estudiantesInscritos: { nombre: string; email: string }[] = [];
  mostrarEstudiantes = false;
  cargandoEstudiantes = false;

  nuevaClase: {
    titulo: string;
    descripcion: string;
    archivos: 'texto' | 'video' | 'enlace' | 'pdf';
    contenidoUrl: string;
    fechaPublicacion: Date;
    id?: string;
  } = {
    titulo: '',
    descripcion: '',
    archivos: 'texto',
    contenidoUrl: '',
    fechaPublicacion: new Date(),
  };

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private claseService: ClaseService,
    private inscripcionService: InscripcionService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (this.cursoId) {
      this.getDatosCurso(this.cursoId);
      this.getClasesPorCurso(this.cursoId);
    }
    this.checkearRol();
    this.obtenerUsuarioLogueado();
    
  }

  async checkearRol(): Promise<void> {
    const user = await this.authService.getUserData();
    this.isEstudiante = user ? user.rol === 'estudiante' : false;
  }

  obtenerUsuarioLogueado(): void {
    this.authService.getUserObservable((user) => {
      if (user) {
        this.usuario = {
          uid: user.uid,
          email: user.email || '',
          nombre: user.displayName || '',
          fotoUrl: user.photoURL || '',
        };
        this.verificarInscripcion();
      } else {
        this.usuario = null;
      }
    });
  }

  verificarInscripcion(): void {
    if (this.cursoId && this.usuario?.uid) {
      this.inscripcionService
        .estaInscrito(this.cursoId, this.usuario.uid)
        .then((inscrito) => {
          this.isInscrito = inscrito;
        });
    }
  }

  async getDatosCurso(id: string): Promise<void> {
    this.curso = await this.cursoService.obtenerCursoPorId(id);
  }

  getClasesPorCurso(cursoId: string): void {
    this.claseService
      .obtenerClasesPorCurso(cursoId)
      .subscribe((clases: Clase[]) => {
        this.clases = clases.sort(
          (a, b) =>
            new Date(a.fechaPublicacion).getTime() -
            new Date(b.fechaPublicacion).getTime()
        );
      });
  }

  inscribirseCurso(): void {
    if (this.cursoId && this.usuario?.uid) {
      this.inscripcionService
        .inscribirEstudiante(this.cursoId, this.usuario.uid)
        .then((inscripcion) => {
          this.isInscrito = true;
          this.inscripcion = inscripcion;
          Swal.fire('¡Inscripción exitosa!', '', 'success');
        })
        .catch((error) => {
          console.error('Error al inscribirse:', error);
        });
    }
  }

  editarClase(clase: Clase): void {
    this.nuevaClase = {
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      archivos: clase.material,
      contenidoUrl: clase.contenidoUrl,
      fechaPublicacion: clase.fechaPublicacion,
      id: clase.id
    };

    this.editandoClase = true;
    this.mostrarFormulario = true;
  }

  addClase(): void {
    if (!this.cursoId || !this.nuevaClase.titulo || !this.nuevaClase.archivos) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const claseData = {
      cursoId: this.cursoId,
      titulo: this.nuevaClase.titulo,
      descripcion: this.nuevaClase.descripcion,
      archivos: this.nuevaClase.archivos,
      material: this.nuevaClase.archivos,
      contenidoUrl: this.nuevaClase.contenidoUrl,
      fechaPublicacion: new Date(),
    };

    if (this.editandoClase && this.nuevaClase.id) {
      this.claseService.actualizarClase(this.nuevaClase.id, claseData).then(() => {
        this.getClasesPorCurso(this.cursoId!);
        this.resetFormulario();
      });
    } else {
      this.claseService.crearClase(claseData).then(() => {
        this.getClasesPorCurso(this.cursoId!);
        this.resetFormulario();
      });
    }
  }

  eliminarClase(id: string) {
    if (confirm('¿Estás seguro de eliminar esta clase?')) {
      this.claseService.eliminarClase(id).then(() => {
        this.getClasesPorCurso(this.cursoId!);
      });
    }
  }

  resetFormulario(): void {
    this.nuevaClase = {
      titulo: '',
      descripcion: '',
      archivos: 'texto',
      contenidoUrl: '',
      fechaPublicacion: new Date(),
    };
    this.editandoClase = false;
    this.mostrarFormulario = false;
  }

  async cargarEstudiantesInscritos(): Promise<void> {
    this.mostrarEstudiantes = !this.mostrarEstudiantes;

    if (this.mostrarEstudiantes) {
      this.cargandoEstudiantes = true;
      this.estudiantesInscritos = [];

      try {
        const inscripciones = await this.inscripcionService.obtenerEstudiantesPorCurso(this.curso?.id || '');

        for (const inscripcion of inscripciones) {
          const user = await this.authService.getUsuarioPorUid(inscripcion.estudianteUid);

          const nombre = user?.nombre || 'Sin nombre';
          const email = user?.email || 'Sin email';

          this.estudiantesInscritos.push({ nombre, email });
        }
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
      } finally {
        this.cargandoEstudiantes = false;
      }
    }
  }
}
