import { Timestamp } from '@angular/fire/firestore';

export class Comentario {
  constructor(
    public id: string,
    public claseId: string,
    public usuarioUid: string,
    public usuarioNombre: string,
    public contenido: string,
    public fecha: Date
  ) {}

  static fromFirestore(data: any, id: string): Comentario {
    const fecha = data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha);
    return new Comentario(
      id,
      data.claseId,
      data.usuarioUid,
      data.usuarioNombre,
      data.contenido,
      fecha
    );
  }
}
