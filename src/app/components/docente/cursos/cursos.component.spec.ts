import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CursosComponent } from './cursos.component';
import { CursoService } from '../../../services/curso.service';
import { ClaseService } from '../../../services/clase.service';
import { ProgresoClaseService } from '../../../services/progreso-clase.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { Clase } from '../../../models/clase.model';

// -------------------------------------------------------------
// 🔹 Inicio del bloque principal
// -------------------------------------------------------------
describe('CursosComponent', () => {
  let component: CursosComponent;
  let fixture: ComponentFixture<CursosComponent>;

  let cursoServiceSpy: jasmine.SpyObj<CursoService>;
  let claseServiceSpy: jasmine.SpyObj<ClaseService>;
  let progresoClaseServiceSpy: jasmine.SpyObj<ProgresoClaseService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // 🔹 Creamos mocks de servicios externos
    const cursoSpy = jasmine.createSpyObj('CursoService', [
      'obtenerCursos',
      'obtenerCursosPorUsuario',
      'crearCurso',
      'actualizarCurso',
      'eliminarCurso',
    ]);

    const claseSpy = jasmine.createSpyObj('ClaseService', [
      'obtenerClasesPorCurso',
    ]);
    const progresoSpy = jasmine.createSpyObj('ProgresoClaseService', [
      'obtenerProgresosPorEstudiante',
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', [
      'getUserId',
      'getUserData',
    ]);

    await TestBed.configureTestingModule({
      imports: [CursosComponent],
      providers: [
        { provide: CursoService, useValue: cursoSpy },
        { provide: ClaseService, useValue: claseSpy },
        { provide: ProgresoClaseService, useValue: progresoSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CursosComponent);
    component = fixture.componentInstance;

    cursoServiceSpy = TestBed.inject(
      CursoService
    ) as jasmine.SpyObj<CursoService>;
    claseServiceSpy = TestBed.inject(
      ClaseService
    ) as jasmine.SpyObj<ClaseService>;
    progresoClaseServiceSpy = TestBed.inject(
      ProgresoClaseService
    ) as jasmine.SpyObj<ProgresoClaseService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture.detectChanges();
  });

  // -------------------------------------------------------------
  // 🔹 Pruebas de inicialización y roles
  // -------------------------------------------------------------
  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería establecer isEstudiante = true si el usuario tiene rol estudiante', async () => {
    authServiceSpy.getUserData.and.returnValue(
      Promise.resolve({ rol: 'estudiante' } as any)
    );

    await component.checkearRol();
    expect(component.isEstudiante).toBeTrue();
  });

  it('debería establecer isEstudiante = false si no hay usuario', async () => {
    authServiceSpy.getUserData.and.returnValue(Promise.resolve(null));
    await component.checkearRol();
    expect(component.isEstudiante).toBeFalse();
  });

  // -------------------------------------------------------------
  // 🔹 Pruebas de abrir/cerrar modal
  // -------------------------------------------------------------
  it('debería abrir y cerrar el modal correctamente', () => {
    component.abrirModal();
    expect(component.mostrarModal).toBeTrue();

    spyOn(component, 'cancelarEdicion');
    component.cerrarModal();
    expect(component.cancelarEdicion).toHaveBeenCalled();
    expect(component.mostrarModal).toBeFalse();
  });

  // -------------------------------------------------------------
  // 🔹 Pruebas de agregar curso
  // -------------------------------------------------------------
  it('debería agregar curso si los datos son válidos', async () => {
    component.nuevoCurso = {
      titulo: 'Curso A',
      descripcion: 'Desc',
      categoria: 'Cat',
      imagenUrl: 'url',
      creadoPorUid: '123',
      fechaCreacion: new Date(),
    };

    cursoServiceSpy.crearCurso.and.returnValue(Promise.resolve('curso-id-1'));
    const swalSpy = spyOn(Swal, 'fire');

    await component.agregarCurso();
    expect(cursoServiceSpy.crearCurso).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'success' })
    );
  });

  it('debería mostrar advertencia si los campos del curso están incompletos', async () => {
    component.nuevoCurso = {
      titulo: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      creadoPorUid: '',
      fechaCreacion: new Date(),
    };

    const swalSpy = spyOn(Swal, 'fire');
    await component.agregarCurso();

    expect(cursoServiceSpy.crearCurso).not.toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'warning' })
    );
  });

  it('debería manejar error al agregar curso', async () => {
    component.nuevoCurso = {
      titulo: 'Curso Error',
      descripcion: 'Desc',
      categoria: 'Cat',
      imagenUrl: 'url',
      creadoPorUid: '123',
      fechaCreacion: new Date(),
    };

    cursoServiceSpy.crearCurso.and.returnValue(Promise.reject('error'));
    const swalSpy = spyOn(Swal, 'fire');
    const consoleSpy = spyOn(console, 'error');

    await component.agregarCurso();

    expect(consoleSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'error' })
    );
  });

  // -------------------------------------------------------------
  // 🔹 Pruebas de modificar curso
  // -------------------------------------------------------------
  it('debería modificar curso correctamente', async () => {
    component.cursoSeleccionado = { id: '1' } as any;
    component.nuevoCurso = {
      titulo: 'Nuevo Título',
      descripcion: 'Nueva Desc',
      categoria: 'Cat',
      imagenUrl: 'url',
      fechaCreacion: new Date(),
    };

    cursoServiceSpy.actualizarCurso.and.returnValue(Promise.resolve());
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve<any>({})
    );

    await component.modificarCurso();

    expect(cursoServiceSpy.actualizarCurso).toHaveBeenCalledWith(
      '1',
      jasmine.any(Object)
    );
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'success' })
    );
  });

  it('debería manejar error al modificar curso', async () => {
    component.cursoSeleccionado = { id: '1' } as any;
    cursoServiceSpy.actualizarCurso.and.returnValue(Promise.reject('error'));

    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve<any>({})
    );
    const consoleSpy = spyOn(console, 'error');

    await component.modificarCurso();

    expect(consoleSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'error' })
    );
  });

  // -------------------------------------------------------------
  // 🔹 Pruebas de eliminar curso
  // -------------------------------------------------------------
  /* it('debería eliminar curso si el usuario confirma', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValues(
      Promise.resolve<any>({ isConfirmed: true }),
      Promise.resolve<any>({})
    );

    cursoServiceSpy.eliminarCurso.and.returnValue(Promise.resolve());
    await component.eliminarCurso('1');
    tick();

    expect(cursoServiceSpy.eliminarCurso).toHaveBeenCalledWith('1');
  }));
 */
  it('no debería eliminar curso si el usuario cancela', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve<any>({ isConfirmed: false })
    );

    await component.eliminarCurso('1');
    tick();

    expect(cursoServiceSpy.eliminarCurso).not.toHaveBeenCalled();
  }));

  it('debería manejar error al eliminar curso', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValues(
      Promise.resolve<any>({ isConfirmed: true }),
      Promise.resolve<any>({})
    );

    cursoServiceSpy.eliminarCurso.and.returnValue(Promise.reject('error'));
    const consoleSpy = spyOn(console, 'error');

    await component.eliminarCurso('1');
    tick();

    expect(consoleSpy).toHaveBeenCalled();
  }));

  // -------------------------------------------------------------
  // 🔹 Pruebas de progreso
  // -------------------------------------------------------------
  it('debería calcular correctamente el progreso del curso', async () => {
    // ejemplo dentro de tu beforeEach o test
    const clasesMock: Clase[] = [
      {
        id: 'c1',
        cursoId: 'curso1',
        titulo: 'Introducción a TypeScript',
        descripcion: 'Clase sobre los fundamentos de TS',
        material: 'pdf',
        contenidoUrl: 'https://example.com/contenido/c1', // <-- propiedad faltante
        fechaPublicacion: new Date('2024-01-01'), // <-- propiedad faltante
      },
      {
        id: 'c2',
        cursoId: 'curso1',
        titulo: 'Avanzado',
        descripcion: 'Segunda clase',
        material: 'pdf',
        contenidoUrl: 'https://example.com/contenido/c2',
        fechaPublicacion: new Date('2024-02-01'),
      },
    ];

    const progresosMock = [
      { cursoId: 'curso1', completado: true },
      { cursoId: 'curso1', completado: false },
    ];

    claseServiceSpy.obtenerClasesPorCurso.and.returnValue(of(clasesMock));
    progresoClaseServiceSpy.obtenerProgresosPorEstudiante.and.returnValue(
      Promise.resolve(progresosMock as any)
    );

    const progreso = await component.calcularProgresoCurso('curso1', 'est1');
    expect(progreso).toBe(50);
  });

  it('debería devolver 0% si no hay clases', async () => {
    claseServiceSpy.obtenerClasesPorCurso.and.returnValue(of([]));
    const progreso = await component.calcularProgresoCurso('curso1', 'est1');
    expect(progreso).toBe(0);
  });

  // -------------------------------------------------------------
  // 🔹 Prueba de método progreso (SVG)
  // -------------------------------------------------------------
  it('debería calcular valores de progreso SVG correctamente', () => {
    const resultado = component.progreso(50);
    expect(resultado).toContain('50');
  });
});
