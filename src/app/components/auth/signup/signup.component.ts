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
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  public nombre: string = '';
  public email: string = '';
  public password: string = '';

  @ViewChild('typedText') typedTextRef!: ElementRef<HTMLSpanElement>;

  constructor(private authService: AuthService, private router: Router) {}

  // Método para redirigir a la página de inicio
  onRedirectToHome(): void {
    this.router.navigate(['/home']);
  }

  // Método para redirigir a la página de inicio de sesión
  onRedirectToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  // Método para iniciar sesión con Email y Contraseña
  async onSignUpWithEmailAndPassword(): Promise<void> {
    if (!this.onValidateFields()) return; // Validar campos
    if (!this.onValidateEmail()) return; // Validar email
    if (!this.onValidatePassword()) return; // Validar contraseña
    try {
      const userCredential = await this.authService.signUpEmailAndPassword(
        this.email,
        this.password,
        this.nombre
      );
      // Registro exitoso
      Swal.fire({
        icon: 'success',
        title: '¡Usuario registrado!',
        text: `Bienvenido, ${this.nombre}`,
        confirmButtonText: 'Ir a Home',
      }).then(() => {
        // Recién aquí se redirige al Home después de hacer clic en "Ir a Home"
        this.onRedirectToHome();
      });
    } catch (error: any) {
      let message = '';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado. Intenta con otro.';
      }
      // Alert de Error de registro
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: message,
      });
    }
  }

  // Método para iniciar sesión con Google
  onSignUpWithGoogle(): void {
    this.authService
      .loginConGoogle()
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Error al registrarse con Google', error);
      });
  }

  // Método para iniciar sesión con Facebook
  onSignUpWithFacebook(): void {
    this.authService
      .loginConFacebook()
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Error al registrarse con Facebook', error);
      });
  }

  // Método para validar campos Email y Password
  onValidateFields(): boolean {
    if (!this.nombre || !this.email || !this.password) {
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

  // Método que se encarga de escribir y borrar el texto en el elemento HTML
  // Se utiliza un intervalo para simular el efecto de escritura
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
