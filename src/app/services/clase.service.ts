import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { Clase } from '../models/clase.model'; // Ajusta según tu estructura
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClaseService {
  private clasesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.clasesCollection = collection(this.firestore, 'clases');
  }

  // ✅ Crear una nueva clase
  async crearClase(clase: Omit<Clase, 'id'>): Promise<string> {
    const docRef = await addDoc(this.clasesCollection, {
      ...clase,
      fechaPublicacion: clase.fechaPublicacion.toISOString(), // formato compatible
    });
    return docRef.id;
  }

  // ✅ Obtener todas las clases de un curso específico
  obtenerClasesPorCurso(cursoId: string): Observable<Clase[]> {
    const q = query(this.clasesCollection, where('cursoId', '==', cursoId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((docs: any[]) => docs.map((doc) => Clase.fromFirestore(doc, doc.id)))
    );
  }

  // ✅ Obtener clase por ID
  async obtenerClasePorId(id: string): Promise<Clase | null> {
    const claseRef = doc(this.firestore, `clases/${id}`);
    const snap = await getDoc(claseRef);
    if (!snap.exists()) return null;
    return Clase.fromFirestore(snap.data(), snap.id);
  }

  // ✅ Actualizar clase
  async actualizarClase(
    id: string,
    datos: Partial<Omit<Clase, 'id' | 'cursoId'>>
  ): Promise<void> {
    const claseRef = doc(this.firestore, `clases/${id}`);
    await updateDoc(claseRef, {
      ...datos,
    });
  }

  // ✅ Eliminar clase
  async eliminarClase(id: string): Promise<void> {
    const claseRef = doc(this.firestore, `clases/${id}`);
    await deleteDoc(claseRef);
  }
}
