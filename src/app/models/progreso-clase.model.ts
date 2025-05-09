export class ProgresoClase {
  constructor(
    public id: string,
    public claseId: string,
    public estudianteUid: string,
    public porcentaje: number,
    public completado: boolean,
    public fechaUltimoAvance: Date,
    public fechaCompletado?: Date
  ) {}

  static fromFirestore(data: any, id: string): ProgresoClase {
    return new ProgresoClase(
      id,
      data.claseId,
      data.estudianteUid,
      data.porcentaje,
      data.completado,
      data.fechaUltimoAvance,
      data.fechaCompletado ? new Date(data.fechaCompletado) : undefined
    );
  }
}
