import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { ProgresoClase } from '../models/progreso-clase.model';

@Injectable({
  providedIn: 'root',
})
export class ProgresoClaseService {
  private progresoCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.progresoCollection = collection(this.firestore, 'progresos-clase');
  }

  // 📝 1. Crear o actualizar progreso
  async registrarAvance(
    claseId: string,
    estudianteUid: string,
    porcentaje: number,
    completado: boolean = false,
    cursoId: string // <-- agrega este parámetro
  ): Promise<void> {
    const id = `${claseId}_${estudianteUid}`;
    const ref = doc(this.firestore, `progresos-clase/${id}`);
    const data: any = {
      claseId,
      estudianteUid,
      porcentaje,
      completado,
      cursoId, // <-- guarda el cursoId aquí
      fechaUltimoAvance: new Date().toISOString(),
    };

    if (completado) {
      data.fechaCompletado = new Date().toISOString();
    }

    await setDoc(ref, data, { merge: true });
  }

  // ✅ 2. Marcar clase como completada
  async marcarComoCompletada(
    claseId: string,
    estudianteUid: string,
    cursoId: string // <-- agrega este parámetro
  ): Promise<void> {
    await this.registrarAvance(claseId, estudianteUid, 100, true, cursoId);
  }

  // 🔍 3. Obtener progreso de una clase
  async obtenerProgreso(
    claseId: string,
    estudianteUid: string
  ): Promise<ProgresoClase | null> {
    const id = `${claseId}_${estudianteUid}`;
    const ref = doc(this.firestore, `progresos-clase/${id}`);
    const snap = await getDoc(ref);
    return snap.exists()
      ? ProgresoClase.fromFirestore(snap.data(), snap.id)
      : null;
  }

  // 📊 4. Obtener todos los progresos de un estudiante
  async obtenerProgresosPorEstudiante(
    estudianteUid: string
  ): Promise<ProgresoClase[]> {
    const q = query(
      this.progresoCollection,
      where('estudianteUid', '==', estudianteUid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      ProgresoClase.fromFirestore(docSnap.data(), docSnap.id)
    );
  }

  // ❌ 5. Eliminar un progreso (opcional)
  async eliminarProgreso(
    claseId: string,
    estudianteUid: string
  ): Promise<void> {
    const id = `${claseId}_${estudianteUid}`;
    const ref = doc(this.firestore, `progresos-clase/${id}`);
    await deleteDoc(ref);
  }

  // 📈 6. Obtener progreso por curso y estudiante
  // progreso-clase.service.ts
  async obtenerProgresosPorCursoYEstudiante(
    cursoId: string,
    estudianteUid: string
  ) {
    // Aquí deberías consultar tu base de datos (Firestore, Supabase, etc.)
    // y filtrar por cursoId y estudianteUid
    // Ejemplo para Firestore:
    const q = query(
      this.progresoCollection,
      where('cursoId', '==', cursoId),
      where('estudianteUid', '==', estudianteUid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      ProgresoClase.fromFirestore(docSnap.data(), docSnap.id)
    );
  }
}
