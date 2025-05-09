// Clase para representar una clase dentro de un curso
export class Clase {
  constructor(
    public id: string,
    public cursoId: string,
    public titulo: string,
    public descripcion: string,
    public tipoContenido: 'texto' | 'video' | 'enlace' | 'pdf',
    public contenidoUrl: string,
    public fechaPublicacion: Date
  ) {}

  static fromFirestore(data: any, id: string): Clase {
    return new Clase(
      id,
      data.cursoId,
      data.titulo,
      data.descripcion,
      data.tipoContenido,
      data.contenidoUrl,
      new Date(data.fechaPublicacion)
    );
  }
}
