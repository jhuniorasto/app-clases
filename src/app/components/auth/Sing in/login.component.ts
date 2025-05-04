import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('typedText') typedTextRef!: ElementRef<HTMLSpanElement>;

  constructor(private authService: AuthService, private router: Router) {}

  loginConGoogle(): void {
    this.authService.loginConGoogle().then(() => {
      this.router.navigate(['/home']);
    }).catch(error => {
      console.error('Error al iniciar sesión con Google', error);
    });
  }

  loginConFacebook(): void {
    this.authService.loginConFacebook().then(() => {
      this.router.navigate(['/home']);
    }).catch(error => {
      console.error('Error al iniciar sesión con Facebook', error);
    });
  }

  ngOnInit(): void {}

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
