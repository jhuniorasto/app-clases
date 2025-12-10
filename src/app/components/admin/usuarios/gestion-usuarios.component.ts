import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Usuario, UserRole } from '../../../models/usuario.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css',
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  cargando: boolean = true;
  rolFiltro: UserRole | 'todos' = 'todos';
  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  usuarioEditando: Usuario | null = null;

  formularioUsuario: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.formularioUsuario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],
      especialidad: [''],
      numeroEstudiante: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
  }

  async cargarUsuarios(): Promise<void> {
    try {
      this.cargando = true;
      this.usuarios = await this.adminService.obtenerUsuarioPorRol();
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros(): void {
    let usuarios = this.usuarios;

    // Filtrar por rol
    if (this.rolFiltro !== 'todos') {
      usuarios = usuarios.filter((u) => u.rol === this.rolFiltro);
    }

    // Filtrar por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      usuarios = usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(termino) ||
          u.email.toLowerCase().includes(termino)
      );
    }

    this.usuariosFiltrados = usuarios;
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  onBusqueda(): void {
    this.aplicarFiltros();
  }

  abrirFormularioNuevo(): void {
    this.usuarioEditando = null;
    this.formularioUsuario.reset({ rol: '' });
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(usuario: Usuario): void {
    this.usuarioEditando = usuario;
    this.formularioUsuario.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      especialidad: usuario.especialidad,
      numeroEstudiante: usuario.numeroEstudiante,
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
      await this.cargarUsuarios();
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
        await this.cargarUsuarios();
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
        await this.cargarUsuarios();
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
}
