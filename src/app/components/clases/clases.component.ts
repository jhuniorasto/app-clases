import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../models/curso.model';
import { Clase } from '../../models/clase.model';
import { ClaseService } from '../../services/clase.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-clases',
  imports: [CommonModule, FormsModule],
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css',
})
export class ClasesComponent {
  cursoId: string | null = '';
  curso: Curso | null = null;
  clases: Clase[] | null = null;

  mostrarFormulario: boolean = false;

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
    private claseService: ClaseService
  ) {}

  ngOnInit(): void {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (this.cursoId) {
      this.getDatosCurso(this.cursoId);
    }
    this.getClasesPorCurso(this.cursoId!);
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

  editarClase(clase: Clase) {
    // Lógica para abrir un modal o navegar al formulario con los datos de la clase
    console.log('Editar clase:', clase);
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
      material: this.nuevaClase.archivos, // Para compatibilidad con el servicio/modelo antiguo
      contenidoUrl: this.nuevaClase.contenidoUrl,
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
