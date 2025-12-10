import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import { MisclasesComponent } from './misclases.component';
import { CursoService } from '../../../core/services/curso.service';
import { ClaseService } from '../../../core/services/clase.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { AuthService } from '../../../core/services/auth.service';
import { SupabasestorageService } from '../../../core/services/supabasestorage.service';
import { ProgresoClaseService } from '../../../core/services/progreso-clase.service';
import { ActivatedRoute } from '@angular/router';
import { materialize, of } from 'rxjs';

describe('MisclasesComponent', () => {
  let component: MisclasesComponent;
  let fixture: ComponentFixture<MisclasesComponent>;
  let cursoServiceSpy: jasmine.SpyObj<CursoService>;
  let claseServiceSpy: jasmine.SpyObj<ClaseService>;
  let inscripcionServiceSpy: jasmine.SpyObj<InscripcionService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let progresoClaseServiceSpy: jasmine.SpyObj<ProgresoClaseService>;

  beforeEach(async () => {
    const routeStub = {
      snapshot: { paramMap: new Map([['id', 'curso1']]) },
    };

    cursoServiceSpy = jasmine.createSpyObj('CursoService', [
      'obtenerCursoPorId',
    ]);
    claseServiceSpy = jasmine.createSpyObj('ClaseService', [
      'obtenerClasesPorCurso',
    ]);
    inscripcionServiceSpy = jasmine.createSpyObj('InscripcionService', [
      'estaInscrito',
      'inscribirEstudiante',
      'obtenerInscripcionPorCursoYEstudiante',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getUserObservable',
      'getUserData',
    ]);
    progresoClaseServiceSpy = jasmine.createSpyObj('ProgresoClaseService', [
      'obtenerProgresosPorEstudiante',
      'marcarComoCompletada',
    ]);

    await TestBed.configureTestingModule({
      imports: [MisclasesComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: CursoService, useValue: cursoServiceSpy },
        { provide: ClaseService, useValue: claseServiceSpy },
        { provide: InscripcionService, useValue: inscripcionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SupabasestorageService, useValue: {} },
        { provide: ProgresoClaseService, useValue: progresoClaseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisclasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  //  TDD Tests
  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar curso en ngOnInit', fakeAsync(() => {
    const mockCurso = {
      id: 'curso1',
      titulo: 'Angular',
      descripcion: 'Curso de Angular',
      creadoPorUid: 'user1',
      fechaCreacion: new Date(),
      categoria: '',
      imagenUrl: '',
      duracion: 10,
      progresoEstudiante: 0,
    };
    cursoServiceSpy.obtenerCursoPorId.and.returnValue(
      Promise.resolve(mockCurso)
    );
    authServiceSpy.getUserObservable.and.callFake((cb: any) =>
      cb({
        uid: 'user1',
        email: 'jastova@ucvvirtual.edu.pe',
        displayName: 'JHUNIOR MANUEL ASTO VALDERRAMA',
        photoURL: '',
      })
    );
    authServiceSpy.getUserData.and.returnValue(
      Promise.resolve({ rol: 'estudiante' })
    );
    inscripcionServiceSpy.obtenerInscripcionPorCursoYEstudiante.and.returnValue(
      Promise.resolve({
        cursoId: '5DBzB9tMis7leCFZ1gjm',
        estudianteUid: 'user1',
        fechaInscripcion: new Date(),
        id: 'inscripcion1',
      })
    );
    inscripcionServiceSpy.estaInscrito.and.returnValue(Promise.resolve(true));
    claseServiceSpy.obtenerClasesPorCurso.and.returnValue(
      of([
        {
          id: 'c1',
          titulo: 'Intro',
          descripcion: 'description',
          material: 'pdf',
          contenidoUrl: 'image.pdf',
          fechaPublicacion: new Date(),
          cursoId: 'curso1',
        },
      ])
    );
    progresoClaseServiceSpy.obtenerProgresosPorEstudiante.and.returnValue(
      Promise.resolve([
        {
          claseId: 'c1',
          completado: true,
          estudianteUid: 'user1',
          cursoId: 'curso1',
          fechaCompletado: new Date(),
          fechaUltimoAvance: new Date(),
          id: 'p1',
        },
      ])
    );
    component.ngOnInit();
    tick();
    flushMicrotasks();
    expect(component.curso?.titulo).toBe('Angular');
    expect(component.usuario?.uid).toBe('user1');
    expect(component.isEstudiante).toBeTrue();
    expect(component.isInscrito).toBeTrue();
    expect(component.clases?.[0].completada).toBeTrue();
  }));

  it('debería marcar clase como completada', fakeAsync(() => {
    component.usuario = { uid: 'user1', email: '', nombre: '', fotoUrl: '' };
    component.cursoId = 'curso1';

    progresoClaseServiceSpy.marcarComoCompletada.and.returnValue(
      Promise.resolve()
    );
    claseServiceSpy.obtenerClasesPorCurso.and.returnValue(of([]));
    component.getClasesPorCurso = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());

    const clase = { id: 'c1', titulo: 'Clase 1' };
    component.marcarClaseComoCompletada(clase);
    tick();

    expect(progresoClaseServiceSpy.marcarComoCompletada).toHaveBeenCalledWith(
      'c1',
      'user1',
      'curso1'
    );
    expect(component.getClasesPorCurso).toHaveBeenCalled();
  }));

  it('debería inscribirse correctamente', fakeAsync(() => {
    component.usuario = { uid: 'user1', email: '', nombre: '', fotoUrl: '' };
    component.cursoId = 'curso1';

    const mockInscripcion = {
      cursoId: 'curso1',
      estudianteUid: 'user1',
      fechaInscripcion: new Date(),
      id: 'insc1',
    };
    inscripcionServiceSpy.inscribirEstudiante.and.returnValue(
      Promise.resolve(mockInscripcion)
    );

    component.inscribirseCurso();
    tick();

    expect(component.isInscrito).toBeTrue();
    expect(component.inscripcion).toEqual(mockInscripcion);
  }));

  it('debería manejar archivo seleccionado', () => {
    const mockFile = new File(['contenido'], 'archivo.pdf', {
      type: 'application/pdf',
    });
    const event = { target: { files: [mockFile] } };

    component.onArchivoSeleccionado(event);
    expect(component.archivoSeleccionado).toBe(mockFile);
  });

  it('debería cancelar inscripción si cursoId o usuario.uid es null', () => {
    spyOn(console, 'error');
    component.usuario = null;
    component.cursoId = null;

    component.inscribirseCurso();
    expect(console.error).toHaveBeenCalledWith(
      'No se puede inscribir: cursoId o usuario.uid es null'
    );
  });
});
