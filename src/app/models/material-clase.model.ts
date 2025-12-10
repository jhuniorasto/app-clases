export type TipoMaterial = 'texto' | 'video' | 'enlace' | 'pdf' | 'archivo';

export class MaterialClase {
  constructor(
    public id: string,
    public claseId: string,
    public titulo: string,
    public descripcion?: string,
    public tipo: TipoMaterial = 'texto',
    public url?: string,
    public creadoPor?: string,
    public fechaCreacion?: Date
  ) {}

  static fromFirestore(data: any, id: string): MaterialClase {
    return new MaterialClase(
      id,
      data.claseId || '',
      data.titulo || '',
      data.descripcion,
      data.tipo || 'texto',
      data.url,
      data.creadoPor,
      data.fechaCreacion ? new Date(data.fechaCreacion) : new Date()
    );
  }

  toFirestore(): any {
    return {
      claseId: this.claseId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      tipo: this.tipo,
      url: this.url,
      creadoPor: this.creadoPor,
      fechaCreacion: this.fechaCreacion,
    };
  }
}
