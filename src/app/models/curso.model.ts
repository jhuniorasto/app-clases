// Clase para representar un curso
// Esta clase se utiliza para crear objetos de curso y también para convertir datos de Firestore a objetos de curso
export class Curso {
  constructor(
    public id: string,
    public titulo: string,
    public descripcion: string,
    public categoria: string,
    public imagenUrl: string,
    public creadoPorUid: string,
    public fechaCreacion: Date
  ) {}

  static fromFirestore(data: any, id: string): Curso {
    return new Curso(
      id,
      data.titulo,
      data.descripcion,
      data.categoria,
      data.imagenUrl,
      data.creadoPorUid,
      new Date(data.fechaCreacion)
    );
  }
}
