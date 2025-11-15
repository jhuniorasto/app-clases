import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Mock mejorado de Firestore
  const mockDoc = {
    delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
  };

  const mockCollection = {
    doc: jasmine.createSpy('doc').and.returnValue(mockDoc),
  };

  const firestoreMock = {
    collection: jasmine.createSpy('collection').and.returnValue(mockCollection),
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        FormBuilder,
        { provide: Firestore, useValue: firestoreMock },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    // Resetear los spies antes de cada test
    firestoreMock.collection.calls.reset();
    mockCollection.doc.calls.reset();
    mockDoc.delete.calls.reset();
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cerrar el modal y limpiar el formulario', () => {
    component.mostrarModal = true;
    component.profesorForm = { nombre: 'Juan', edad: 25, curso: 'Math' };

    component.cerrarModal();

    expect(component.mostrarModal).toBeFalse();
    expect(component.profesorForm).toEqual({ nombre: '', edad: 0, curso: '' });
  });

  it('debería abrir y cerrar modal de edición', () => {
    const profesor = { id: '1', nombre: 'Juan', edad: 25, curso: 'Física' };

    component.abrirModalEditar(profesor);
    expect(component.mostrarModalEditar).toBeTrue();
    expect(component.profesorEditado.nombre).toBe('Juan');

    component.cerrarModalEditar();
    expect(component.mostrarModalEditar).toBeFalse();
    expect(component.profesorEditado.nombre).toBe('');
  });

  /*   it('debería eliminar un profesor cuando el usuario confirma', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true }) as any
    );

    component.profesores = [
      { id: '1', nombre: 'A', edad: 22, curso: 'X' },
      { id: '2', nombre: 'B', edad: 30, curso: 'Y' },
    ];

    await component.eliminarProfesor('1');
    tick();

    expect(deleteDocMock).toHaveBeenCalled();
  }));
 */
  /*   it('no debería eliminar si el usuario cancela', fakeAsync(async () => {
    // Configurar el mock de SweetAlert2
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false }) as any
    );

    // Configurar el estado inicial
    component.profesores = [{ id: '1', nombre: 'A', edad: 22, curso: 'X' }];

    // Ejecutar el método
    await component.eliminarProfesor('1');
    tick();

    // Verificar que no se llamó a delete()
    expect(firestoreMock.collection).not.toHaveBeenCalled();
    expect(mockCollection.doc).not.toHaveBeenCalled();
    expect(mockDoc.delete).not.toHaveBeenCalled();
  })); */
  /* 
  it('debería manejar error al eliminar profesor', fakeAsync(async () => {
    const consoleSpy = spyOn(console, 'error');

    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true }) as any
    );

    deleteDocMock.and.callFake(async () => {
      throw new Error('Firestore error');
    });

    await component.eliminarProfesor('1');
    tick();

    expect(consoleSpy).toHaveBeenCalled();
  })); */

  /*   it('no debería agregar profesor con datos inválidos', async () => {
    // Configura el formulario con datos inválidos
    component.profesorForm = {
      nombre: '', // nombre inválido (vacío)
      edad: 0,
      curso: '', // curso inválido (vacío)
    };
    // Intenta agregar el profesor
    await component.confirmarAgregarProfesor();
    // Verifica que no se llamó a collection().add()
    expect(firestoreMock.collection).not.toHaveBeenCalled();
  }); */
});
