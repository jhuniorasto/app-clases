import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(private router: Router) {}

  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onRedirectToProfesores(): void {
    this.router.navigate(['/admin']);
  }

  onRedirectToCursos(): void {
    this.router.navigate(['/cursos']);
  }

  onRedirectToHome(): void {
    this.router.navigate(['/home']);
  }
}
