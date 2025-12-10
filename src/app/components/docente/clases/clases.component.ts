import { supabase } from '../../../../environments/supabase.client';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../../services/curso.service';
import { Curso } from '../../../models/curso.model';
import { Clase } from '../../../models/clase.model';
import { Usuario } from '../../../models/usuario.model';
import { Inscripcion } from '../../../models/inscripcion.model';
import { ClaseService } from '../../../services/clase.service';
import { InscripcionService } from '../../../services/inscripcion.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { SupabasestorageService } from '../../../services/supabasestorage.service';
import Swal from 'sweetalert2';
import { ComentariosComponent } from '../../comentarios/comentarios.component';
import { NotaService } from '../../../services/nota.service';
import { MaterialClase } from '../../../models/material-clase.model';
@Component({
  selector: 'app-clases',
  imports: [CommonModule, FormsModule, ComentariosComponent],
  standalone: true,
  templateUrl: './clases.component.html',
  styleUrls: ['./clases.component.css'],
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
  // Formularios y estados para materiales y notas
  showMaterialForm: { [claseId: string]: boolean } = {};
  materialForm: Partial<MaterialClase> = {
    titulo: '',
    descripcion: '',
    tipo: 'texto',
    url: '',
  };

  imagenPorDefecto: string = 'https://cdn-icons-png.flaticon.com/512/4539/4539220.png';

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
    private supabaseStorageService: SupabasestorageService,
    private usuarioService: UsuarioService,
    private notaService: NotaService
  ) {}

  async ngOnInit() {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (this.cursoId) {
      this.getDatosCurso(this.cursoId);
    }
    this.getClasesPorCurso(this.cursoId!);
    this.checkearRol();
    this.obtenerUsuarioLogueado();
    // Verificar accesibilidad del bucket de almacenamiento
    try {
      const res = await this.supabaseStorageService.verificarBucket();
      if (!res.ok) {
        Swal.fire({ icon: 'warning', title: 'Problema con almacenamiento', text: `No se puede acceder al bucket de archivos: ${res.message}` });
      }
    } catch (err) {
      console.error('Error al verificar bucket:', err);
    }
  }

  // Datos auth para permisos
  currentUid: string | null = null;
  currentRole: string | null = null;
  puedeEditar: boolean = false;

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

    // Obtener uid y rol actual
    try {
      this.currentUid = await this.authService.getUserId();
      this.currentRole = await this.authService.getRole();
      // si el curso ya fue cargado, chequear propietario
      this.puedeEditar = this.currentRole === 'admin' || (this.currentRole === 'docente' && this.currentUid === this.curso?.creadoPorUid);
    } catch (err) {
      console.error('Error al obtener datos auth:', err);
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
          rol: 'estudiante', // Valor por defecto si no tienes el rol en el objeto user
          toFirestore: () => ({
            uid: user.uid,
            email: user.email || '',
            nombre: user.displayName || '',
            fotoUrl: user.photoURL || '',
            rol: 'estudiante', // Valor por defecto si no tienes el rol en el objeto user
          }),
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
    // Intentar obtener el nombre del docente que creó el curso
    try {
      if (this.curso?.creadoPorUid) {
        const u = await this.usuarioService.obtenerUsuarioPorUid(this.curso.creadoPorUid);
        if (u) {
          (this.curso as any).creadoPorNombre = u.nombre || u.email || this.curso.creadoPorUid;
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener nombre del docente:', err);
    }
  }

  getCursoDocenteNombre(): string {
    if (!this.curso) return 'Desconocido';
    const anyCurso: any = this.curso as any;
    return anyCurso.creadoPorNombre || this.curso.creadoPorUid || 'Desconocido';
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
          Swal.fire({ icon: 'success', title: 'Inscripción', text: 'Inscripción exitosa' });
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
    console.log('cursoId:', this.cursoId);
    if (!this.cursoId || !this.nuevaClase.titulo || !this.nuevaClase.archivos) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Todos los campos son obligatorios' });
      return;
    }

    let archivoUrl = this.nuevaClase.contenidoUrl || '';
    if (this.archivoSeleccionado) {
      try {
        archivoUrl = (await this.supabaseStorageService.subirArchivo(this.archivoSeleccionado)) || '';
        console.log('Archivo subido, URL:', archivoUrl);
      } catch (error: any) {
        console.error('Error en subirArchivo():', error);
        Swal.fire({ icon: 'error', title: 'Error al subir archivo', text: error?.message || 'Error al subir el archivo' });
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

  // ---------- Materiales (RF09) ----------
  toggleMaterialForm(claseId: string) {
    this.showMaterialForm[claseId] = !this.showMaterialForm[claseId];
    this.materialForm = { titulo: '', descripcion: '', tipo: 'texto', url: '' };
  }

  async addMaterial(claseId: string): Promise<void> {
    if (!this.cursoId || !claseId) return;

    if (!this.currentUid) {
      this.currentUid = await this.authService.getUserId();
      this.currentRole = await this.authService.getRole();
    }

    if (!(this.currentRole === 'admin' || this.currentRole === 'docente')) {
      Swal.fire({ icon: 'warning', title: 'Sin permisos', text: 'No tienes permisos para crear materiales' });
      return;
    }

    let url = this.materialForm.url || '';
    if (this.archivoSeleccionado) {
      try {
        url = (await this.supabaseStorageService.subirArchivo(this.archivoSeleccionado)) || '';
      } catch (error: any) {
        console.error('Error al subir archivo de material:', error);
        Swal.fire({ icon: 'error', title: 'Error al subir archivo', text: error?.message || 'Error al subir el archivo de material' });
        return;
      }
    }

    const materialData = {
      claseId,
      titulo: this.materialForm.titulo || 'Material',
      descripcion: this.materialForm.descripcion,
      tipo: (this.materialForm.tipo as any) || 'texto',
      url,
      creadoPor: this.currentUid || this.usuario?.uid,
    };

    try {
      await this.claseService.crearMaterial(materialData);
      Swal.fire({ icon: 'success', title: 'Material creado', text: 'Material creado correctamente' });
      this.showMaterialForm[claseId] = false;
      this.archivoSeleccionado = null;
    } catch (error) {
      console.error('Error al crear material:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al crear material' });
    }
  }

  // ---------- Notas (RF10) ----------
  async registrarNotaPrompt(claseId: string) {
    if (!this.cursoId) return;
    if (!this.currentUid) {
      this.currentUid = await this.authService.getUserId();
      this.currentRole = await this.authService.getRole();
    }

    if (!(this.currentRole === 'admin' || this.currentRole === 'docente')) {
      Swal.fire({ icon: 'warning', title: 'Sin permisos', text: 'No tienes permisos para registrar notas' });
      return;
    }

    const estudianteUid = prompt('Ingrese el UID del estudiante');
    if (!estudianteUid) return;
    const valorStr = prompt('Ingrese la calificación (número)');
    if (!valorStr) return;
    const valor = Number(valorStr);
    if (isNaN(valor)) {
      Swal.fire({ icon: 'error', title: 'Valor inválido', text: 'Ingrese un número válido' });
      return;
    }

    try {
      await this.notaService.registrarNota({
        cursoId: this.cursoId,
        claseId,
        estudianteUid,
        valor,
        docenteUid: this.currentUid || undefined,
      });
      Swal.fire({ icon: 'success', title: 'Nota registrada', text: 'La nota fue registrada correctamente' });
    } catch (error) {
      console.error('Error al registrar nota:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al registrar nota' });
    }
  }

  eliminarClase(id: string) {
    if (confirm('¿Estás seguro de eliminar esta clase?')) {
      this.claseService.eliminarClase(id).then(() => {
        console.log('Clase eliminada');
      });
    }
  }
}
