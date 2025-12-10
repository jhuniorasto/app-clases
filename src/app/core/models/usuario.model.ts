// Tipos de roles disponibles
export type UserRole = 'estudiante' | 'docente' | 'admin';

// Interface para estado de usuario
export interface UsuarioEstado {
  activo: boolean;
  razonDesactivacion?: string;
  fechaDesactivacion?: Date;
}

// Clase de usuario para el sistema de autenticación
export class Usuario {
  constructor(
    public uid: string,
    public nombre: string,
    public email: string,
    public rol: UserRole = 'estudiante',
    public fotoUrl?: string,
    public fechaRegistro?: Date,
    public estado?: UsuarioEstado,
    public especialidad?: string, // Para docentes
    public numeroEstudiante?: string // Para estudiantes
  ) {}

  static fromFirestore(data: any, uid: string): Usuario {
    return new Usuario(
      uid,
      data.nombre,
      data.email,
      data.rol || 'estudiante',
      data.fotoUrl,
      data.fechaRegistro?.toDate?.() || new Date(),
      data.estado || { activo: true },
      data.especialidad,
      data.numeroEstudiante
    );
  }

  toFirestore(): any {
    return {
      uid: this.uid,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      fotoUrl: this.fotoUrl,
      fechaRegistro: this.fechaRegistro,
      estado: this.estado || { activo: true },
      especialidad: this.especialidad,
      numeroEstudiante: this.numeroEstudiante,
    };
  }
}
