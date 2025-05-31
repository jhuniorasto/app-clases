import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comentario } from '../../models/comentario.model';
import { ComentarioService } from '../../services/comentario.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit, OnChanges {
  @Input() claseId!: string;

  comentarios$!: Observable<Comentario[]>;
  nuevoComentario: string = '';
  usuarioNombre: string = '';
  usuarioUid: string = '';

  constructor(
    private comentarioService: ComentarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable((user) => {
      if (user) {
        this.usuarioUid = user.uid;
        this.usuarioNombre = user.displayName || 'Anónimo';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claseId'] && this.claseId) {
      console.log('claseId cambiado o inicializado:', this.claseId);
      this.cargarComentarios();
    }
  }

  private cargarComentarios(): void {
    console.log('Cargando comentarios para claseId:', this.claseId);
    this.comentarios$ = this.comentarioService.obtenerComentariosPorClase(this.claseId);
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
}
