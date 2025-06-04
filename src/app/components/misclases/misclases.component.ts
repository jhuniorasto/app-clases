import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../services/curso.service';
import { ActivatedRoute } from '@angular/router';
import { Curso } from '../../models/curso.model';
import { Clase } from '../../models/clase.model';
import { Usuario } from '../../models/usuario.model';
import { Inscripcion } from '../../models/inscripcion.model';
import { ClaseService } from '../../services/clase.service';
import { InscripcionService } from '../../services/inscripcion.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SupabasestorageService } from '../../services/supabasestorage.service';
import { ComentariosComponent } from '../comentarios/comentarios.component';
import { ProgresoClaseService } from '../../services/progreso-clase.service';
import Swal from 'sweetalert2';
type ClaseConCompletada = Clase & { completada?: boolean };
@Component({
  selector: 'app-misclases',
  standalone: true,
  imports: [CommonModule, FormsModule, ComentariosComponent],
  templateUrl: './misclases.component.html',
  styleUrl: './misclases.component.css',
})
export class MisclasesComponent {
  cursoId: string | null = '';
  curso: Curso | null = null;
  clases: ClaseConCompletada[] | null = null;
  usuario: Usuario | null = null;
  mostrarFormulario: boolean = false;
  isInscrito: boolean = false;
  inscripcion: Inscripcion | null = null;
  isEstudiante: boolean = false;
  archivoSeleccionado: File | null = null;
  progresosCursos: { [cursoId: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private claseService: ClaseService,
    private inscripcionService: InscripcionService,
    private authService: AuthService,
    private supabaseStorageService: SupabasestorageService,
    private progresoClaseService: ProgresoClaseService
  ) {}

  ngOnInit(): void {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (this.cursoId) {
      this.getDatosCurso(this.cursoId);
    }
    this.checkearRol();
    this.obtenerUsuarioLogueado();
  }

  descargarArchivo(url: string, nombre: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async checkearRol(): Promise<void> {
    const user = await this.authService.getUserData();

    if (user) {
      this.isEstudiante = user.rol === 'estudiante';
    } else {
      this.isEstudiante = false;
    }
  }

  obtenerUsuarioLogueado(): void {
    // Obtener usuario logueado
    this.authService.getUserObservable((user) => {
      console.log(user);

      if (user) {
        this.usuario = {
          uid: user.uid,
          email: user.email || '',
          nombre: user.displayName || '',
          fotoUrl: user.photoURL || '',
        };
        this.verificarInscripcion();
        if (this.cursoId) {
          this.getClasesPorCurso(this.cursoId);
        }
      } else {
        this.usuario = null;
      }
      console.log('Usuario logueado:', this.usuario);
    });
  }

  verificarInscripcion(): void {
    if (this.cursoId && this.usuario?.uid) {
      this.inscripcionService
        .estaInscrito(this.cursoId, this.usuario.uid)
        .then((inscrito) => {
          console.log('Inscrito:', inscrito);
          this.isInscrito = inscrito;
        });
    }
  }

  async getDatosCurso(id: string): Promise<void> {
    this.curso = await this.cursoService.obtenerCursoPorId(id);
    console.log('Curso:', this.curso);
  }

  async getClasesPorCurso(cursoId: string): Promise<void> {
    this.claseService
      .obtenerClasesPorCurso(cursoId)
      .subscribe(async (clases: Clase[]) => {
        if (this.usuario?.uid && this.isEstudiante) {
          // Obtén los progresos del estudiante
          const progresos =
            await this.progresoClaseService.obtenerProgresosPorEstudiante(
              this.usuario.uid
            );
          // Agrega la propiedad 'completada' a cada clase según el progreso
          this.clases = clases.map((clase) => ({
            ...clase,
            completada: progresos.some(
              (p: any) => p.claseId === clase.id && p.completado
            ),
          }));
        } else {
          this.clases = clases;
        }
      });
  }

  inscribirseCurso(): void {
    // Lógica para inscribirse en el curso
    if (this.cursoId && this.usuario?.uid) {
      this.inscripcionService
        .inscribirEstudiante(this.cursoId, this.usuario.uid)
        .then((inscripcion) => {
          this.isInscrito = true; // Cambia el estado de inscripción
          this.inscripcion = inscripcion; // Guarda la inscripción
          console.log('Inscripción exitosa:', inscripcion);
          alert('Inscripción exitosa');
        })
        .catch((error) => {
          console.error('Error al inscribirse:', error);
        });
    } else {
      console.error('No se puede inscribir: cursoId o usuario.uid es null');
    }
  }

  editarClase(clase: Clase) {
    // Lógica para abrir un modal o navegar al formulario con los datos de la clase
    console.log('Editar clase:', clase);
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      // Aquí podrías subir el archivo a Supabase o manejarlo como necesites
    }
  }

  async marcarClaseComoCompletada(clase: any) {
    if (!this.usuario?.uid || !clase.id) return;

    await this.progresoClaseService.marcarComoCompletada(
      clase.id,
      this.usuario.uid,
      this.cursoId || '' // Asegúrate de pasar el cursoId si es necesario
    );

    Swal.fire({
      icon: 'success',
      title: 'Clase Completada',
      text: `Has completado la clase: ${clase.titulo}`,
    });

    // Vuelve a cargar las clases para refrescar el estado desde la base de datos
    if (this.cursoId) {
      await this.getClasesPorCurso(this.cursoId);
    }
  }
}
