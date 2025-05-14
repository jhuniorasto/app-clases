// Clase de usuario para el sistema de autenticación
export class Usuario {
  constructor(
    public uid: string,
    public nombre: string,
    public email: string,
    public rol: 'estudiante' | 'profesor',
    public fotoUrl?: string,
    public fechaRegistro?: Date  // ✅ Ya convertido a Date
  ) {}

  static fromFirestore(data: any, uid: string): Usuario {
    return new Usuario(
      uid,
      data.nombre,
      data.email,
      data.rol,
      data.fotoUrl,
      data.fechaRegistro?.toDate?.() || null  // ✅ Conversión segura de Timestamp a Date
    );
  }
}
