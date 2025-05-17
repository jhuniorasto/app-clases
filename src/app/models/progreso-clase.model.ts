export class ProgresoClase {
  constructor(
    public id: string,
    public claseId: string,
    public estudianteUid: string,
    public completado: boolean,
    public fechaUltimoAvance: Date,
    public cursoId?: string, // OPCIONAL (para facilitar búsquedas por curso)
    public fechaCompletado?: Date
  ) {}

  static fromFirestore(data: any, id: string): ProgresoClase {
    return new ProgresoClase(
      id,
      data.claseId,
      data.estudianteUid,
      data.completado,
      data.fechaUltimoAvance,
      data.cursoId,
      data.fechaCompletado ? new Date(data.fechaCompletado) : undefined
    );
  }
}
