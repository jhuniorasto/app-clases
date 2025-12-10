import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comentario } from '../../core/models/comentario.model';
import { ComentarioService } from '../../core/services/comentario.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css'],
})
export class ComentariosComponent implements OnInit, OnChanges {
  @Input() claseId!: string;

  comentarios$!: Observable<Comentario[]>;
  nuevoComentario: string = '';
  usuarioNombre: string = '';
  usuarioUid: string = '';
  isDocente: boolean = false;
  respuestaMap: { [comentarioId: string]: string } = {};

  constructor(
    private comentarioService: ComentarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable(async (user) => {
      if (user) {
        this.usuarioUid = user.uid;

        // Cargar usuario con más detalles desde Firestore
        const usuarioCompleto = await this.authService.getUserData(); // Usa tu método que sí obtiene el rol

        if (usuarioCompleto) {
          this.usuarioNombre = usuarioCompleto.nombre || 'Anónimo';
          this.isDocente = usuarioCompleto.rol === 'docente';
          console.log(
            '[DEBUG] Rol cargado desde Firestore:',
            usuarioCompleto.rol
          );
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claseId'] && this.claseId) {
      this.cargarComentarios();
    }
  }

  private cargarComentarios(): void {
    this.comentarios$ = this.comentarioService.obtenerComentariosPorClase(
      this.claseId
    );
  }

  async enviarComentario() {
    if (!this.nuevoComentario.trim()) return;

    const nuevo: Omit<Comentario, 'id'> = {
      claseId: this.claseId,
      usuarioUid: this.usuarioUid,
      contenido: this.nuevoComentario,
      fecha: new Date(),
      usuarioNombre: this.usuarioNombre,
    };

    try {
      await this.comentarioService.crearComentario(nuevo);
      this.nuevoComentario = '';
      this.cargarComentarios();
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    }
  }

  async responderComentario(comentarioId: string) {
    const respuestaTexto = this.respuestaMap[comentarioId]?.trim();
    if (!respuestaTexto) return;

    const respuesta = {
      contenido: respuestaTexto,
      docenteUid: this.usuarioUid,
      docenteNombre: this.usuarioNombre,
      fecha: new Date(),
    };

    try {
      await this.comentarioService.agregarRespuestaAComentario(
        comentarioId,
        respuesta
      );
      this.respuestaMap[comentarioId] = '';
      this.cargarComentarios();
    } catch (error) {
      console.error('Error al responder comentario:', error);
    }
  }

  cancelarRespuesta(comentarioId: string) {
    delete this.respuestaMap[comentarioId];
  }
}
