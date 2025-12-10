import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [CommonModule, FormsModule],
})
export class LoginComponent implements OnInit, AfterViewInit {
  public email: string = '';
  public password: string = '';
  isEstudiante: boolean = false;
  isAdmin: boolean = false;
  isDocente: boolean = false;

  @ViewChild('typedText') typedTextRef!: ElementRef<HTMLSpanElement>;

  constructor(private authService: AuthService, private router: Router) {}

  // Método para redirigir a la página de inicio

  async checkearRol(): Promise<void> {
    const user = await this.authService.getUserData();

    if (user) {
      this.isEstudiante = user.rol === 'estudiante';
      this.isAdmin = user.rol === 'admin';
      this.isDocente = user.rol === 'docente';
    } else {
      this.isEstudiante = false;
      this.isAdmin = false;
      this.isDocente = false;
    }
  }
  redirectByRole(rol: string): void {
    const rutasPorRol: Record<string, string> = {
      admin: '/admin',
      docente: '/cursos',
      estudiante: '/miscursos',
    };

    const ruta = rutasPorRol[rol] ?? '/';
    this.router.navigate([ruta]);
  }

  // Método para redirigir a la página de registro
  onRedirectToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  // Método para iniciar sesión con Email y Contraseña
  // Método para iniciar sesión con Email y Contraseña
  onLoginWithEmailAndPassword(): void {
    if (!this.onValidateFields()) return;
    if (!this.onValidateEmail()) return;
    if (!this.onValidatePassword()) return;

    this.authService
      .loginConEmailPassword(this.email, this.password)
      .then(async () => {
        // 👉 Obtener los datos del usuario con rol
        const userData = await this.authService.getUserData();

        if (!userData || !userData.rol) {
          console.error('No se pudo obtener el rol del usuario');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener información del usuario.',
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: '¡Usuario verificado!',
          text: `Bienvenido`,
          confirmButtonText: 'Ir a Home',
        }).then(() => {
          // 👉 Redirigir según el rol
          this.redirectByRole(userData.rol);
        });
      })
      .catch((error) => {
        console.error(
          'Error al iniciar sesión con Email y Contraseña',
          error.message
        );

        if (error.code === 'auth/invalid-credential') {
          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: 'Credenciales inválidas. Por favor, verifica tu correo electrónico o contraseña.',
          });
        }
      });
  }

  // Método para validar campos Email y Password
  onValidateFields(): boolean {
    if (!this.email || !this.password) {
      alert('Por favor, completa todos los campos.');
      return false;
    }
    return true;
  }

  // Método para validar el formato del correo electrónico
  onValidateEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      alert('Por favor, introduce un correo electrónico válido.');
      return false;
    }
    return true;
  }

  // Validar la longitud de la contraseña
  onValidatePassword(): boolean {
    if (this.password.length < 5) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    return true;
  }

  ngOnInit(): void {}

  // Método que se ejecuta después de que la vista ha sido inicializada
  // y que inicia el efecto de escritura
  ngAfterViewInit(): void {
    this.typeText();
  }
  phrases: string[] = [
    'Bienvenido a la plataforma.a',
    'Explora cursos interactivos.s',
    'Aprende a tu ritmo.o',
  ];
  currentPhraseIndex = 0;
  charIndex = 0;
  isDeleting = false;
  typingInterval: any;

  // Método que maneja el efecto de escritura
  typeText(): void {
    if (typeof document !== 'undefined') {
      const element = this.typedTextRef?.nativeElement;
      if (!element) return;

      const currentPhrase = this.phrases[this.currentPhraseIndex];

      if (this.isDeleting) {
        element.textContent = currentPhrase.substring(0, this.charIndex--);
      } else {
        element.textContent = currentPhrase.substring(0, this.charIndex++);
      }

      // Velocidad de escritura/borrado
      let typingSpeed = this.isDeleting ? 50 : 100;

      // Cuando termina de escribir una frase
      if (!this.isDeleting && this.charIndex === currentPhrase.length) {
        typingSpeed = 1500; // Espera antes de borrar
        this.isDeleting = true;
      }

      // Cuando termina de borrar
      if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.currentPhraseIndex =
          (this.currentPhraseIndex + 1) % this.phrases.length;
        typingSpeed = 500;
      }

      clearTimeout(this.typingInterval);
      this.typingInterval = setTimeout(() => this.typeText(), typingSpeed);
    }
  }
}
