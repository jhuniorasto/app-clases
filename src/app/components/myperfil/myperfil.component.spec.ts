import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MyperfilComponent } from './myperfil.component';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';

describe('MyperfilComponent', () => {
  let component: MyperfilComponent;
  let fixture: ComponentFixture<MyperfilComponent>;

  // 🔹 Creamos mocks de los servicios
  const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
  const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
    'obtenerUsuarioPorUid',
  ]);

  beforeEach(async () => {
    authServiceSpy.getUserId.calls.reset();
    usuarioServiceSpy.obtenerUsuarioPorUid.calls.reset();
    await TestBed.configureTestingModule({
      imports: [MyperfilComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyperfilComponent);
    component = fixture.componentInstance;
  });

  // ------------------------------------------------------------------
  // 🔹 Test 1: Creación del componente
  // ------------------------------------------------------------------
  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // ------------------------------------------------------------------
  // 🔹 Test 2: Cargar usuario cuando existe UID
  // ------------------------------------------------------------------
  it('debería obtener el usuario cuando hay UID', fakeAsync(async () => {
    const mockUser: Usuario = {
      id: '123',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      rol: 'estudiante',
    } as unknown as Usuario;

    authServiceSpy.getUserId.and.returnValue(Promise.resolve('123'));
    usuarioServiceSpy.obtenerUsuarioPorUid.and.returnValue(
      Promise.resolve(mockUser)
    );

    await component.ngOnInit();
    tick(); // simula tiempo de ejecución async

    expect(authServiceSpy.getUserId).toHaveBeenCalled();
    expect(usuarioServiceSpy.obtenerUsuarioPorUid).toHaveBeenCalledWith('123');
    expect(component.usuario).toEqual(mockUser);
    expect(component.cargando).toBeFalse();
  }));

  // ------------------------------------------------------------------
  // 🔹 Test 3: No obtiene usuario si no hay UID
  // ------------------------------------------------------------------
  it('no debería llamar a UsuarioService si no hay UID', fakeAsync(async () => {
    authServiceSpy.getUserId.and.returnValue(Promise.resolve(null));

    await component.ngOnInit();
    tick();

    expect(authServiceSpy.getUserId).toHaveBeenCalled();
    expect(usuarioServiceSpy.obtenerUsuarioPorUid).not.toHaveBeenCalled();
    expect(component.usuario).toBeNull();
    expect(component.cargando).toBeFalse();
  }));
});
