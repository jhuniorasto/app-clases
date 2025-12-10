// Clase para representar una clase dentro de un curso
export class Clase {
  constructor(
    public id: string,
    public cursoId: string,
    public titulo: string,
    public descripcion: string,
    public material: 'texto' | 'video' | 'enlace' | 'pdf',
    public contenidoUrl: string,
    public fechaPublicacion: Date
  ) {}

  // Método de fábrica para crear una instancia desde Firestore
  static fromFirestore(data: any, id: string): Clase {
    return new Clase(
      id,
      data.cursoId ?? '',
      data.titulo ?? '',
      data.descripcion ?? '',
      data.material ?? 'texto',
      data.contenidoUrl ?? '',
      data.fechaPublicacion ? new Date(data.fechaPublicacion) : new Date()
    );
  }
}
