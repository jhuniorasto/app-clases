import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // 🔹 Creamos mocks (espías)
    const authSpy = jasmine.createSpyObj('AuthService', [
      'loginConEmailPassword',
      'loginConGoogle',
      'loginConFacebook',
    ]);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de validaciones
  // ------------------------------------------------------------------

  it('debería validar que todos los campos estén llenos', () => {
    component.email = '';
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

  it('debería redirigir al estudiante a sus cursos', () => {
    component.redirectByRole('estudiante');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/miscursos']);
  });

  it('debería redirigir al signup', () => {
    component.onRedirectToSignUp();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/signup']);
  });

  // ------------------------------------------------------------------
  // 🔹 Pruebas de login con email y contraseña
  // ------------------------------------------------------------------

  it('debería iniciar sesión correctamente con email y contraseña', fakeAsync(() => {
    component.email = 'test@example.com';
    component.password = '12345678';

    const mockUserCredential = {
      user: { uid: 'uid-test' },
      providerId: 'password',
      operationType: 'signIn',
    } as any;
    authServiceSpy.loginConEmailPassword.and.returnValue(
      Promise.resolve(mockUserCredential)
    );
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve<any>({ isConfirmed: true })
    );

    component.onLoginWithEmailAndPassword();
    tick();
    fixture.detectChanges();

    expect(authServiceSpy.loginConEmailPassword).toHaveBeenCalledWith(
      'test@example.com',
      '12345678'
    );
    expect(swalSpy).toHaveBeenCalled();
  }));

  it('debería manejar error de credenciales inválidas', fakeAsync(() => {
    component.email = 'wrong@example.com';
    component.password = '12345678';

    const error = {
      code: 'auth/invalid-credential',
      message: 'Credenciales inválidas',
    };
    authServiceSpy.loginConEmailPassword.and.returnValue(Promise.reject(error));
    const swalSpy = spyOn(Swal, 'fire');

    component.onLoginWithEmailAndPassword();
    tick();

    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Credenciales inválidas. Por favor, verifica tu correo electrónico o contraseña.',
      })
    );
  }));
});
