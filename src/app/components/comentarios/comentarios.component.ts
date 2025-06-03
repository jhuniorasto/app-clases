import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comentario } from '../../models/comentario.model';
import { ComentarioService } from '../../services/comentario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css'] // ✅ corrección aquí
})
export class ComentariosComponent implements OnInit {
  @Input() claseId!: string;

  comentarios: Comentario[] = [];
  nuevoComentario: string = '';
  usuarioNombre: string = '';
  usuarioUid: string = '';

  constructor(
    private comentarioService: ComentarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Cargar usuario actual
    this.authService.getUserObservable((user) => {
      if (user) {
        this.usuarioUid = user.uid;
        this.usuarioNombre = user.displayName || 'Anónimo';
        console.log('Usuario autenticado:', this.usuarioNombre);
      }
    });

    // 2. Verificar que claseId está definido antes de cargar comentarios
    if (this.claseId) {
      this.comentarioService
        .obtenerComentariosPorClase(this.claseId)
        .subscribe((comentarios) => {
          this.comentarios = comentarios;
          console.log(`Comentarios para clase ${this.claseId}:`, comentarios);
        });
    } else {
      console.warn('claseId no definido en <app-comentarios>');
    }
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
      console.log('Comentario enviado:', nuevo);
      this.nuevoComentario = '';
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    }
  }
}
