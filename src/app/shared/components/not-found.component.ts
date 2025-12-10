import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="container min-vh-100 d-flex align-items-center justify-content-center"
    >
      <div class="text-center">
        <h1 class="display-1 fw-bold text-primary">404</h1>
        <p class="fs-3 text-secondary">
          <span class="text-danger">¡Oops!</span> Página no encontrada
        </p>
        <p class="lead text-muted">
          La página que buscas no existe o ha sido movida.
        </p>
        <a routerLink="/signin" class="btn btn-primary btn-lg mt-3">
          <i class="bi bi-house-door me-2"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class NotFoundComponent {}
