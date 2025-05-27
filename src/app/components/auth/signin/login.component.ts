import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
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

  @ViewChild('typedText') typedTextRef!: ElementRef<HTMLSpanElement>;

  constructor(private authService: AuthService, private router: Router) {}

  // Método para redirigir a la página de inicio
  onRedirectToHome(): void {
    this.router.navigate(['/home']);
  }

  // Método para redirigir a la página de registro
  onRedirectToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  // Método para iniciar sesión con Email y Contraseña
  onLoginWithEmailAndPassword(): void {
    if (!this.onValidateFields()) return; // Validar campos
    if (!this.onValidateEmail()) return; // Validar email
    if (!this.onValidatePassword()) return; // Validar contraseña

    // Si las validaciones son correctas, se procede a iniciar sesión
    // con Email y Contraseña
    this.authService
      .loginConEmailPassword(this.email, this.password)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario verificado!',
          text: `Bienvenido`,
          confirmButtonText: 'Ir a Home',
        }).then(() => {
          // Recién aquí se redirige al Home después de hacer clic en "Ir a Home"
          this.onRedirectToHome();
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
            title: 'Error al registrar',
            text: 'Credenciales inválidas. Por favor, verifica tu correo electrónico o contraseña.',
          });
        }
      });
  }

  // Método para iniciar sesión con Google
  onLoginWithGoogle(): void {
    this.authService
      .loginConGoogle()
      .then(() => {
        this.onRedirectToHome();
      })
      .catch((error) => {
        console.error('Error al iniciar sesión con Google', error);
      });
  }

  // Método para iniciar sesión con Facebook
  onLoginWithFacebook(): void {
    this.authService
      .loginConFacebook()
      .then(() => {
        this.onRedirectToHome();
      })
      .catch((error) => {
        console.error('Error al iniciar sesión con Facebook', error);
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
    if (this.password.length < 8) {
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
