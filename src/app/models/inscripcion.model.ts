// Clase para representar una inscripción de un estudiante a un curso
export class Inscripcion {
  constructor(
    public id: string,
    public cursoId: string,
    public estudianteUid: string,
    public fechaInscripcion: Date
  ) {}

  static fromFirestore(data: any, id: string): Inscripcion {
    return new Inscripcion(
      id,
      data.cursoId,
      data.estudianteUid,
      new Date(data.fechaInscripcion)
    );
  }
}
