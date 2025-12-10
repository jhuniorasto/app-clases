import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Usuario, UserRole } from '../../../core/models/usuario.model';
import Swal from 'sweetalert2';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionUsuariosComponent implements OnInit, OnDestroy {
  private reload$ = new BehaviorSubject<void>(undefined);
  private rolFiltro$ = new BehaviorSubject<UserRole | 'todos'>('todos');
  private terminoBusqueda$ = new BehaviorSubject<string>('');

  usuarios$ = this.reload$.pipe(
    tap(() => this.cargando$.next(true)),
    switchMap(() =>
      from(this.adminService.obtenerUsuarioPorRol()).pipe(
        tap(() => this.cargando$.next(false)),
        catchError((error) => {
          console.error('Error al cargar usuarios:', error);
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
          this.cargando$.next(false);
          return of([] as Usuario[]);
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  usuariosFiltrados$ = combineLatest([
    this.usuarios$,
    this.rolFiltro$,
    this.terminoBusqueda$,
  ]).pipe(
    map(([usuarios, rol, termino]) => {
      let lista = usuarios;
      if (rol !== 'todos') {
        lista = lista.filter((u) => u.rol === rol);
      }
      if (termino.trim()) {
        const t = termino.toLowerCase();
        lista = lista.filter(
          (u) =>
            u.nombre.toLowerCase().includes(t) ||
            u.email.toLowerCase().includes(t)
        );
      }
      return lista;
    })
  );

  cargando$ = new BehaviorSubject<boolean>(true);
  mostrarFormulario: boolean = false;
  usuarioEditando: Usuario | null = null;

  formularioUsuario: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.formularioUsuario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      rol: ['', Validators.required],
      especialidad: [''],
      numeroEstudiante: [''],
    });

    this.configurarValidacionPassword(true);
  }

  async ngOnInit(): Promise<void> {
    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.cargando$.complete();
    this.rolFiltro$.complete();
    this.terminoBusqueda$.complete();
  }

  onFiltroChange(value: UserRole | 'todos'): void {
    this.rolFiltro$.next(value);
  }

  onBusqueda(value: string): void {
    this.terminoBusqueda$.next(value);
  }

  get rolFiltroValue(): UserRole | 'todos' {
    return this.rolFiltro$.value;
  }

  get terminoBusquedaValue(): string {
    return this.terminoBusqueda$.value;
  }

  abrirFormularioNuevo(): void {
    this.usuarioEditando = null;
    this.formularioUsuario.reset({ rol: '' });
    this.configurarValidacionPassword(true);
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(usuario: Usuario): void {
    this.usuarioEditando = usuario;
    this.configurarValidacionPassword(false);
    this.formularioUsuario.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      especialidad: usuario.especialidad,
      numeroEstudiante: usuario.numeroEstudiante,
      password: '',
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formularioUsuario.reset();
    this.usuarioEditando = null;
  }

  async guardarUsuario(): Promise<void> {
    if (this.formularioUsuario.invalid) {
      Swal.fire(
        'Error',
        'Por favor completa todos los campos requeridos',
        'error'
      );
      return;
    }

    try {
      const datos = this.formularioUsuario.value;

      if (this.usuarioEditando) {
        // Actualizar usuario existente
        await this.adminService.actualizarUsuario(this.usuarioEditando.uid, {
          nombre: datos.nombre,
          email: datos.email,
          rol: datos.rol as UserRole,
          especialidad: datos.especialidad,
          numeroEstudiante: datos.numeroEstudiante,
        });
        Swal.fire('✅ Éxito', 'Usuario actualizado correctamente', 'success');
      } else {
        // Crear nuevo usuario
        await this.adminService.crearCuentaUsuario({
          nombre: datos.nombre,
          email: datos.email,
          password: datos.password,
          rol: datos.rol,
          especialidad: datos.especialidad,
          numeroEstudiante: datos.numeroEstudiante,
        });
        Swal.fire('✅ Éxito', 'Usuario creado correctamente', 'success');
      }

      this.cerrarFormulario();
      this.reload$.next();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      Swal.fire(
        'Error',
        error.message || 'No se pudo guardar el usuario',
        'error'
      );
    }
  }

  async desactivarUsuario(usuario: Usuario): Promise<void> {
    const resultado = await Swal.fire({
      title: '⚠️ ¿Desactivar usuario?',
      text: `¿Estás seguro de que deseas desactivar a ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ Sí, desactivar',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#f5576c',
    });

    if (resultado.isConfirmed) {
      try {
        await this.adminService.desactivarUsuario(
          usuario.uid,
          'Desactivado por admin'
        );
        Swal.fire('✅ Éxito', 'Usuario desactivado correctamente', 'success');
        this.reload$.next();
      } catch (error) {
        Swal.fire('Error', 'No se pudo desactivar el usuario', 'error');
      }
    }
  }

  async eliminarUsuario(usuario: Usuario): Promise<void> {
    const resultado = await Swal.fire({
      title: '🗑️ ¿Eliminar usuario?',
      text: `¿Estás seguro de que deseas eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: '✅ Sí, eliminar',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#f5576c',
    });

    if (resultado.isConfirmed) {
      try {
        await this.adminService.eliminarUsuario(usuario.uid);
        Swal.fire('✅ Éxito', 'Usuario eliminado correctamente', 'success');
        this.reload$.next();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    }
  }

  getRolColor(rol: UserRole): string {
    switch (rol) {
      case 'estudiante':
        return 'primary';
      case 'docente':
        return 'success';
      case 'admin':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getRolIcon(rol: UserRole): string {
    switch (rol) {
      case 'estudiante':
        return '👤';
      case 'docente':
        return '👨‍🏫';
      case 'admin':
        return '⚙️';
      default:
        return '❓';
    }
  }

  trackByUid(_: number, usuario: Usuario): string {
    return usuario.uid;
  }

  private configurarValidacionPassword(esRequerida: boolean): void {
    const control = this.formularioUsuario.get('password');
    if (!control) return;

    if (esRequerida) {
      control.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity();
  }
}
