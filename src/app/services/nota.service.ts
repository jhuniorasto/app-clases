import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  CollectionReference,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Nota } from '../models/nota.model';

export type NotaInput = {
  cursoId: string;
  estudianteUid: string;
  valor: number;
  claseId?: string;
  comentario?: string;
  docenteUid?: string;
};

@Injectable({
  providedIn: 'root',
})
export class NotaService {
  private notasCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.notasCollection = collection(this.firestore, 'notas');
  }

  // RF10: Registrar una nota (crea)
  async registrarNota(nota: NotaInput): Promise<string> {
    const docRef = await addDoc(this.notasCollection, {
      ...nota,
      fechaRegistro: new Date().toISOString(),
    });
    return docRef.id;
  }

  // Obtener notas por curso
  async obtenerNotasPorCurso(cursoId: string): Promise<Nota[]> {
    const q = query(this.notasCollection, where('cursoId', '==', cursoId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => Nota.fromFirestore(docSnap.data(), docSnap.id));
  }

  // Obtener notas por estudiante
  async obtenerNotasPorEstudiante(estudianteUid: string): Promise<Nota[]> {
    const q = query(this.notasCollection, where('estudianteUid', '==', estudianteUid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => Nota.fromFirestore(docSnap.data(), docSnap.id));
  }

  // Obtener notas por clase
  async obtenerNotasPorClase(claseId: string): Promise<Nota[]> {
    const q = query(this.notasCollection, where('claseId', '==', claseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => Nota.fromFirestore(docSnap.data(), docSnap.id));
  }

  // Actualizar nota
  async actualizarNota(id: string, datos: Partial<Nota>): Promise<void> {
    const ref = doc(this.firestore, `notas/${id}`);
    await updateDoc(ref, datos as any);
  }

  // Eliminar nota
  async eliminarNota(id: string): Promise<void> {
    const ref = doc(this.firestore, `notas/${id}`);
    await deleteDoc(ref);
  }
}
