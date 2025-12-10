import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Clase } from '../../../models/clase.model';
import { Usuario } from '../../../models/usuario.model';
import { Inscripcion } from '../../../models/inscripcion.model';
import { Nota } from '../../../models/nota.model';
import { ClaseService } from '../../../services/clase.service';
import { InscripcionService } from '../../../services/inscripcion.service';
import { UsuarioService } from '../../../services/usuario.service';
import { NotaService } from '../../../services/nota.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { CursoService } from '../../../services/curso.service';

interface EstudianteNotas {
  estudianteUid: string;
  usuario?: Usuario | null;
  notasPorClase: { [claseId: string]: Nota | null };
  promedio: number;
  editando: { [claseId: string]: boolean };
  valorTemporal: { [claseId: string]: number };
}

@Component({
  selector: 'app-libro-notas',
  templateUrl: './libro-notas.component.html',
  styleUrls: ['./libro-notas.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LibroNotasComponent {
  cursoId: string | null = null;
  clases: Clase[] = [];
  estudiantes: EstudianteNotas[] = [];
  cargando: boolean = false;
  // Auth
  currentUid: string | null = null;
  currentRole: string | null = null;
  cursoOwnerUid: string | null = null;
  puedeEditar: boolean = false;
  // Modal para edición (mejora UX)
  modalVisible: boolean = false;
  modalEstudiante?: EstudianteNotas | null = null;
  modalClaseId?: string | null = null;
  modalValor?: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private claseService: ClaseService,
    private inscripcionService: InscripcionService,
    private usuarioService: UsuarioService,
    private notaService: NotaService
    ,
    private authService: AuthService,
    private cursoService: CursoService
  ) {}

  async ngOnInit() {
    this.cursoId = this.route.snapshot.paramMap.get('id');
    if (!this.cursoId) return;
    this.cargando = true;

    // Obtener datos auth y curso para validar permisos
    try {
      this.currentUid = await this.authService.getUserId();
      this.currentRole = await this.authService.getRole();
      const curso = await this.cursoService.obtenerCursoPorId(this.cursoId);
      this.cursoOwnerUid = curso?.creadoPorUid || null;
      this.puedeEditar = (this.currentRole === 'admin') || (this.currentRole === 'docente' && this.currentUid === this.cursoOwnerUid);
    } catch (err) {
      console.error('Error al obtener auth/curso para permisos:', err);
      this.puedeEditar = false;
    }

    // Obtener clases
    try {
      this.clases = await firstValueFrom(this.claseService.obtenerClasesPorCurso(this.cursoId));
    } catch (err) {
      console.error('Error al obtener clases:', err);
      this.clases = [];
    }

    // Obtener inscripciones (estudiantes)
    try {
      const inscripciones: Inscripcion[] = await this.inscripcionService.obtenerEstudiantesPorCurso(this.cursoId);

      // Por cada inscripcion, armar estructura EstudianteNotas
      for (const ins of inscripciones) {
        const estudianteUid = ins.estudianteUid;
        const usuario = await this.usuarioService.obtenerUsuarioPorUid(estudianteUid);

        // Obtener notas del estudiante y filtrar por curso
        const notasEstudiante = await this.notaService.obtenerNotasPorEstudiante(estudianteUid);
        const notasFiltradas = notasEstudiante.filter((n) => n.cursoId === this.cursoId);

        const notasPorClase: { [claseId: string]: Nota | null } = {};
        for (const clase of this.clases) {
          const nota = notasFiltradas.find((n) => n.claseId === clase.id) || null;
          notasPorClase[clase.id] = nota;
        }

        const valores = Object.values(notasPorClase).filter((n): n is Nota => !!n).map((n) => n.valor);
        const promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;

        this.estudiantes.push({
          estudianteUid,
          usuario,
          notasPorClase,
          promedio,
          editando: {},
          valorTemporal: {},
        });
      }
    } catch (err) {
      console.error('Error al obtener inscripciones o notas:', err);
    }

    this.cargando = false;
  }

  empezarEdicion(est: EstudianteNotas, claseId: string) {
    // Mantener por compatibilidad; preferir modal
    if (!this.puedeEditar) {
      Swal.fire({ icon: 'warning', title: 'Sin permisos', text: 'No tienes permisos para editar notas en este curso' });
      return;
    }
    this.openModalFor(est, claseId);
  }

  cancelarEdicion(est: EstudianteNotas, claseId: string) {
    est.editando[claseId] = false;
    delete est.valorTemporal[claseId];
  }

  async guardarNota(est: EstudianteNotas, claseId: string) {
    const valor = Number(est.valorTemporal[claseId]);
    if (isNaN(valor)) {
      Swal.fire({ icon: 'error', title: 'Valor inválido', text: 'Ingrese un número válido' });
      return;
    }

    const notaExistente = est.notasPorClase[claseId];
    try {
      if (notaExistente && notaExistente.id) {
        await this.notaService.actualizarNota(notaExistente.id, { valor, docenteUid: this.currentUid || undefined });
        notaExistente.valor = valor;
      } else {
        const nuevaId = await this.notaService.registrarNota({
          cursoId: this.cursoId!,
          claseId,
          estudianteUid: est.estudianteUid,
          valor,
          docenteUid: this.currentUid || undefined,
        });
        // Obtener la nota recién creada para tener su id y datos
        const notas = await this.notaService.obtenerNotasPorEstudiante(est.estudianteUid);
        const nuevaNota = notas.find((n) => n.id === nuevaId) || notas.find((n) => n.claseId === claseId && n.cursoId === this.cursoId) || null;
        est.notasPorClase[claseId] = nuevaNota;
      }

      // Recalcular promedio
      const valores = Object.values(est.notasPorClase).filter((n): n is Nota => !!n).map((n) => n.valor);
      est.promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
      est.editando[claseId] = false;
    } catch (err) {
      console.error('Error al guardar nota:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la nota' });
    }
  }

  // ---------------- Modal UX ----------------
  openModalFor(est: EstudianteNotas, claseId: string) {
    if (!this.puedeEditar) {
      Swal.fire({ icon: 'warning', title: 'Sin permisos', text: 'No tienes permisos para editar notas en este curso' });
      return;
    }
    this.modalVisible = true;
    this.modalEstudiante = est;
    this.modalClaseId = claseId;
    const nota = est.notasPorClase[claseId];
    this.modalValor = nota ? nota.valor : 0;
  }

  closeModal() {
    this.modalVisible = false;
    this.modalEstudiante = null;
    this.modalClaseId = null;
    this.modalValor = null;
  }

  async saveFromModal() {
    if (!this.modalEstudiante || !this.modalClaseId) return;
    const est = this.modalEstudiante;
    const claseId = this.modalClaseId;
    const valor = Number(this.modalValor);
    if (isNaN(valor)) {
      Swal.fire({ icon: 'error', title: 'Valor inválido', text: 'Ingrese un número válido' });
      return;
    }

    const notaExistente = est.notasPorClase[claseId];
    try {
      if (notaExistente && notaExistente.id) {
        await this.notaService.actualizarNota(notaExistente.id, { valor, docenteUid: this.currentUid || undefined });
        notaExistente.valor = valor;
      } else {
        const nuevaId = await this.notaService.registrarNota({
          cursoId: this.cursoId!,
          claseId,
          estudianteUid: est.estudianteUid,
          valor,
          docenteUid: this.currentUid || undefined,
        });
        const notas = await this.notaService.obtenerNotasPorEstudiante(est.estudianteUid);
        const nuevaNota = notas.find((n) => n.id === nuevaId) || notas.find((n) => n.claseId === claseId && n.cursoId === this.cursoId) || null;
        est.notasPorClase[claseId] = nuevaNota;
      }

      // Recalcular promedio
      const valores = Object.values(est.notasPorClase).filter((n): n is Nota => !!n).map((n) => n.valor);
      est.promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
      this.closeModal();
    } catch (err) {
      console.error('Error al guardar nota desde modal:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la nota' });
    }
  }

  getClaseTitulo(id: string | null | undefined): string {
    if (!id) return '';
    const c = this.clases.find((x) => x.id === id);
    return c ? c.titulo : '';
  }
}
