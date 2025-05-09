import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { Inscripcion } from '../models/inscripcion.model';

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
  private inscripcionesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.inscripcionesCollection = collection(this.firestore, 'inscripciones');
  }

  // 📝 1. Inscribir a un estudiante en un curso
  async inscribirEstudiante(
    cursoId: string,
    estudianteUid: string
  ): Promise<void> {
    const id = `${cursoId}_${estudianteUid}`; // ID personalizado
    const ref = doc(this.firestore, `inscripciones/${id}`);
    await setDoc(ref, {
      cursoId,
      estudianteUid,
      fechaInscripcion: new Date().toISOString(),
    });
  }

  // 🔍 2. Verificar si un estudiante ya está inscrito en un curso
  async estaInscrito(cursoId: string, estudianteUid: string): Promise<boolean> {
    const id = `${cursoId}_${estudianteUid}`;
    const ref = doc(this.firestore, `inscripciones/${id}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  // 📚 3. Obtener cursos inscritos por estudiante
  async obtenerInscripcionesPorEstudiante(
    estudianteUid: string
  ): Promise<Inscripcion[]> {
    const q = query(
      this.inscripcionesCollection,
      where('estudianteUid', '==', estudianteUid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      Inscripcion.fromFirestore(docSnap.data(), docSnap.id)
    );
  }

  // 🧑‍🎓 4. Obtener estudiantes inscritos a un curso
  async obtenerEstudiantesPorCurso(cursoId: string): Promise<Inscripcion[]> {
    const q = query(
      this.inscripcionesCollection,
      where('cursoId', '==', cursoId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      Inscripcion.fromFirestore(docSnap.data(), docSnap.id)
    );
  }

  // ❌ 5. Cancelar inscripción (opcional)
  async cancelarInscripcion(
    cursoId: string,
    estudianteUid: string
  ): Promise<void> {
    const id = `${cursoId}_${estudianteUid}`;
    const ref = doc(this.firestore, `inscripciones/${id}`);
    await deleteDoc(ref);
  }
}
