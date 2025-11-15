import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { ComentariosComponent } from './comentarios.component';
import { ComentarioService } from '../../services/comentario.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ComentariosComponent', () => {
  let component: ComentariosComponent;
  let fixture: ComponentFixture<ComentariosComponent>;
  let comentarioServiceSpy: jasmine.SpyObj<ComentarioService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // ✅ Creamos mocks para los servicios
    const comentarioSpy = jasmine.createSpyObj('ComentarioService', [
      'obtenerComentariosPorClase',
      'crearComentario',
      'agregarRespuestaAComentario',
    ]);

    const authSpy = jasmine.createSpyObj('AuthService', [
      'getUserObservable',
      'getUserData',
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [],
      providers: [
        { provide: ComentarioService, useValue: comentarioSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComentariosComponent);
    component = fixture.componentInstance;

    comentarioServiceSpy = TestBed.inject(
      ComentarioService
    ) as jasmine.SpyObj<ComentarioService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  // 👇 Aquí escribiremos los tests
  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  //==================================================================================
  // 🔹 Pruebas TDD
  //============================================================================

  it('debería cargar los comentarios cuando cambia el claseId', () => {
    const mockComentarios = [
      {
        id: '1',
        contenido: 'Hola',
        usuarioNombre: 'Juan',
        claseId: 'abc',
        usuarioUid: 'user1',
        fecha: new Date('2023-01-01'),
      },
    ];

    comentarioServiceSpy.obtenerComentariosPorClase.and.returnValue(
      of(mockComentarios)
    );

    component.claseId = 'abc';
    component.ngOnChanges({
      claseId: {
        currentValue: 'abc',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    component.comentarios$.subscribe((comentarios) => {
      expect(comentarios.length).toBe(1);
      expect(comentarios[0].contenido).toBe('Hola');
    });
  });

  it('debería cargar el usuario y establecer rol en ngOnInit', fakeAsync(() => {
    const mockUser = { uid: 'user123' };
    const mockUserData = { nombre: 'Jhunior', rol: 'docente' };

    authServiceSpy.getUserObservable.and.callFake((callback: any) => {
      return callback(mockUser);
    });
    authServiceSpy.getUserData.and.returnValue(Promise.resolve(mockUserData));

    component.ngOnInit();
    tick();

    expect(component.usuarioUid).toBe('user123');
    expect(component.usuarioNombre).toBe('Jhunior');
    expect(component.isDocente).toBeTrue();
  }));

  it('no debería enviar comentario si el campo está vacío', fakeAsync(() => {
    component.nuevoComentario = '   ';
    const cargarSpy = spyOn<any>(component, 'cargarComentarios');

    component.enviarComentario();
    tick();

    expect(comentarioServiceSpy.crearComentario).not.toHaveBeenCalled();
    expect(cargarSpy).not.toHaveBeenCalled();
  }));

  it('debería enviar comentario correctamente', fakeAsync(() => {
    component.claseId = 'curso1';
    component.usuarioUid = 'user1';
    component.usuarioNombre = 'Jhunior';
    component.nuevoComentario = 'Este es un comentario';

    comentarioServiceSpy.crearComentario.and.returnValue(Promise.resolve('ok'));
    const cargarSpy = spyOn<any>(component, 'cargarComentarios');

    component.enviarComentario();
    tick();

    expect(comentarioServiceSpy.crearComentario).toHaveBeenCalledWith(
      jasmine.objectContaining({
        contenido: 'Este es un comentario',
        claseId: 'curso1',
        usuarioUid: 'user1',
        usuarioNombre: 'Jhunior',
      })
    );
    expect(component.nuevoComentario).toBe('');
    expect(cargarSpy).toHaveBeenCalled();
  }));

  it('no debería responder si el texto está vacío', fakeAsync(() => {
    component.respuestaMap['c1'] = '   ';
    component.usuarioUid = 'doc1';
    component.usuarioNombre = 'Profe';

    const cargarSpy = spyOn<any>(component, 'cargarComentarios');

    component.responderComentario('c1');
    tick();

    expect(
      comentarioServiceSpy.agregarRespuestaAComentario
    ).not.toHaveBeenCalled();
    expect(cargarSpy).not.toHaveBeenCalled();
  }));

  it('debería responder a un comentario correctamente', fakeAsync(() => {
    component.respuestaMap['c1'] = 'Gracias por tu aporte';
    component.usuarioUid = 'doc1';
    component.usuarioNombre = 'Profe';

    comentarioServiceSpy.agregarRespuestaAComentario.and.returnValue(
      Promise.resolve()
    );
    const cargarSpy = spyOn<any>(component, 'cargarComentarios');

    component.responderComentario('c1');
    tick();

    expect(
      comentarioServiceSpy.agregarRespuestaAComentario
    ).toHaveBeenCalledWith(
      'c1',
      jasmine.objectContaining({
        contenido: 'Gracias por tu aporte',
        docenteUid: 'doc1',
        docenteNombre: 'Profe',
      })
    );
    expect(component.respuestaMap['c1']).toBe('');
    expect(cargarSpy).toHaveBeenCalled();
  }));

  it('debería cancelar una respuesta correctamente', () => {
    component.respuestaMap['c1'] = 'Texto temporal';
    component.cancelarRespuesta('c1');
    expect(component.respuestaMap['c1']).toBeUndefined();
  });
});
