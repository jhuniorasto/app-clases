import { supabase } from './../../../environments/supabase.client';
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
import { SupabasestorageService } from '../../services/supabasestorage.service';
import { ComentariosComponent } from '../comentarios/comentarios.component';
@Component({
  selector: 'app-clases',
  imports: [CommonModule, FormsModule, ComentariosComponent],
  standalone: true,
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css',
})
export class ClasesComponent {
  cursoId: string | null = '';
  curso: Curso | null = null;
  clases: Clase[] | null = null;
  usuario: Usuario | null = null;
  mostrarFormulario: boolean = false;
  isInscrito: boolean = false;
  inscripcion: Inscripcion | null = null;
  isEstudiante: boolean = false;
  archivoSeleccionado: File | null = null;

  nuevaClase: {
    titulo: string;
    descripcion: string;
    archivos: 'texto' | 'video' | 'enlace' | 'pdf';
    contenidoUrl: string;
    fechaPublicacion: Date;
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
    private supabaseStorageService: SupabasestorageService
  ) {}

  ngOnInit(): void {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (this.cursoId) {
      this.getDatosCurso(this.cursoId);
    }
    this.getClasesPorCurso(this.cursoId!);
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

  getClasesPorCurso(cursoId: string): void {
    this.claseService
      .obtenerClasesPorCurso(cursoId)
      .subscribe((clases: Clase[]) => {
        // Ordenar por fechaPublicacion ascendente (de la más antigua a la más reciente)
        this.clases = clases.sort(
          (a, b) =>
            new Date(a.fechaPublicacion).getTime() -
            new Date(b.fechaPublicacion).getTime()
        );
        console.log('Clases:', this.clases);
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

  async addClase(): Promise<void> {
    if (!this.cursoId || !this.nuevaClase.titulo || !this.nuevaClase.archivos) {
      alert('Todos los campos son obligatorios');
      return;
    }

    let archivoUrl = this.nuevaClase.contenidoUrl || '';
    if (this.archivoSeleccionado) {
      archivoUrl =
        (await this.supabaseStorageService.subirArchivo(
          this.archivoSeleccionado
        )) || '';
      if (!archivoUrl) {
        alert('Error al subir el archivo');
        return;
      }
    }

    const claseData = {
      cursoId: this.cursoId,
      titulo: this.nuevaClase.titulo,
      descripcion: this.nuevaClase.descripcion,
      archivos: this.nuevaClase.archivos,
      material: this.nuevaClase.archivos, // Para compatibilidad
      contenidoUrl: archivoUrl,
      fechaPublicacion: new Date(),
    };

    this.claseService.crearClase(claseData).then((id) => {
      console.log('Clase creada con ID:', id);
      this.getClasesPorCurso(this.cursoId!);
      this.nuevaClase = {
        titulo: '',
        descripcion: '',
        archivos: 'texto',
        contenidoUrl: '',
        fechaPublicacion: new Date(),
      };
      this.archivoSeleccionado = null;
      this.mostrarFormulario = false;
    });
  }

  eliminarClase(id: string) {
    if (confirm('¿Estás seguro de eliminar esta clase?')) {
      this.claseService.eliminarClase(id).then(() => {
        console.log('Clase eliminada');
      });
    }
  }
}
