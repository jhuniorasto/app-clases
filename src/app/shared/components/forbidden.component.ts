import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="container min-vh-100 d-flex align-items-center justify-content-center"
    >
      <div class="text-center">
        <h1 class="display-1 fw-bold text-warning">403</h1>
        <p class="fs-3 text-secondary">
          <span class="text-danger">¡Acceso denegado!</span>
        </p>
        <p class="lead text-muted">
          No tienes permisos para acceder a esta página.
        </p>
        <a routerLink="/signin" class="btn btn-warning btn-lg mt-3">
          <i class="bi bi-arrow-left me-2"></i>
          Volver
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
export class ForbiddenComponent {}
