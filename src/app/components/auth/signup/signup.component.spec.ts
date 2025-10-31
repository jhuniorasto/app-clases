import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // 🔹 Creamos mocks (espías) de servicios externos
    const authSpy = jasmine.createSpyObj('AuthService', [
      'signUpEmailAndPassword',
      'loginConGoogle',
      'loginConFacebook',
    ]);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de validaciones
  // ------------------------------------------------------------------

  it('debería validar que todos los campos estén llenos', () => {
    component.nombre = '';
    component.email = 'test@example.com';
    component.password = '12345678';
    spyOn(window, 'alert');

    const result = component.onValidateFields();
    expect(result).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith(
      'Por favor, completa todos los campos.'
    );
  });

  it('debería validar el formato del email', () => {
    component.email = 'correo-invalido';
    spyOn(window, 'alert');

    const result = component.onValidateEmail();
    expect(result).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith(
      'Por favor, introduce un correo electrónico válido.'
    );
  });

  it('debería validar la longitud mínima de la contraseña', () => {
    component.password = '123';
    spyOn(window, 'alert');

    const result = component.onValidatePassword();
    expect(result).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith(
      'La contraseña debe tener al menos 8 caracteres.'
    );
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de navegación
  // ------------------------------------------------------------------

  it('debería redirigir al home', () => {
    component.onRedirectToHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería redirigir al signin', () => {
    component.onRedirectToSignIn();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/signin']);
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de registro con email y contraseña
  // ------------------------------------------------------------------

  it('debería registrar un usuario correctamente', async () => {
    component.nombre = 'Juan';
    component.email = 'juan@test.com';
    component.password = '12345678';

    const mockUser = { user: { uid: 'abc123' } };
    authServiceSpy.signUpEmailAndPassword.and.returnValue(
      Promise.resolve(mockUser as any)
    );

    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve<any>({ isConfirmed: true })
    );

    await component.onSignUpWithEmailAndPassword();
    fixture.detectChanges();

    expect(authServiceSpy.signUpEmailAndPassword).toHaveBeenCalledWith(
      'juan@test.com',
      '12345678',
      'Juan'
    );
    expect(swalSpy).toHaveBeenCalled();
  });

  it('debería mostrar error si el correo ya está en uso', async () => {
    component.nombre = 'Ana';
    component.email = 'ana@test.com';
    component.password = '12345678';

    const error = { code: 'auth/email-already-in-use' };
    authServiceSpy.signUpEmailAndPassword.and.returnValue(
      Promise.reject(error as any)
    );

    const swalSpy = spyOn(Swal, 'fire');

    await component.onSignUpWithEmailAndPassword();
    fixture.detectChanges();

    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Este correo ya está registrado. Intenta con otro.',
      })
    );
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de registro con Google y Facebook
  // ------------------------------------------------------------------

  it('debería registrarse con Google correctamente', fakeAsync(() => {
    const mockUser = { user: { uid: 'uid-google' } } as any; // mock con forma de Usuario
    authServiceSpy.loginConGoogle.and.returnValue(Promise.resolve(mockUser));
    component.onSignUpWithGoogle();
    tick(); // resuelve la Promise
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('debería manejar error al registrarse con Google', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    authServiceSpy.loginConGoogle.and.returnValue(Promise.reject('error'));
    component.onSignUpWithGoogle();
    tick();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al registrarse con Google',
      'error'
    );
  }));

  it('debería registrarse con Facebook correctamente', fakeAsync(() => {
    const mockUser = { user: { uid: 'uid-facebook' } } as any; // mock con forma de Usuario
    authServiceSpy.loginConFacebook.and.returnValue(Promise.resolve(mockUser));
    component.onSignUpWithFacebook();
    tick();
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('debería manejar error al registrarse con Facebook', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    authServiceSpy.loginConFacebook.and.returnValue(Promise.reject('error'));
    component.onSignUpWithFacebook();
    tick();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al registrarse con Facebook',
      'error'
    );
  }));
});
