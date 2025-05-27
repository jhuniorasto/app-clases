export class Comentario {
  constructor(
    public id: string,
    public claseId: string,
    public usuarioUid: string,
    public contenido: string,
    public fecha: Date,
    public usuarioNombre: string 
  ) {}

  static fromFirestore(data: any, id: string): Comentario {
    return new Comentario(
      id,
      data.claseId,
      data.usuarioUid,
      data.contenido,
      new Date(data.fecha),
      data.usuarioNombre || 'Anónimo'
    );
  }
}
