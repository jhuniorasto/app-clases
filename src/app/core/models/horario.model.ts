export interface Horario {
  id?: string;
  cursoId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  docenteUid?: string;
  fechaCreacion?: Date | string;
}
