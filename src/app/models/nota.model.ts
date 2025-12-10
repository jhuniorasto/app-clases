export class Nota {
  constructor(
    public id: string,
    public cursoId: string,
    public estudianteUid: string,
    public valor: number,
    public fechaRegistro: Date,
    public claseId?: string,
    public comentario?: string,
    public docenteUid?: string
  ) {}

  static fromFirestore(data: any, id: string): Nota {
    return new Nota(
      id,
      data.cursoId || '',
      data.estudianteUid || '',
      typeof data.valor === 'number' ? data.valor : Number(data.valor) || 0,
      data.fechaRegistro ? new Date(data.fechaRegistro) : new Date(),
      data.claseId,
      data.comentario,
      data.docenteUid
    );
  }

  toFirestore(): any {
    return {
      cursoId: this.cursoId,
      estudianteUid: this.estudianteUid,
      valor: this.valor,
      fechaRegistro: this.fechaRegistro,
      claseId: this.claseId,
      comentario: this.comentario,
      docenteUid: this.docenteUid,
    };
  }
}
