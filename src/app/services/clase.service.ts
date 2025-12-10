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
import { MaterialClase } from '../models/material-clase.model';
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClaseService {
  private clasesCollection: CollectionReference;
  private materialesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.clasesCollection = collection(this.firestore, 'clases');
    this.materialesCollection = collection(this.firestore, 'materiales-clase');
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

  // ---------- Materiales de clase (RF09) ----------
  typeMaterialInput: any;
  async crearMaterial(material: { claseId: string; titulo: string; descripcion?: string; tipo?: string; url?: string; creadoPor?: string; }): Promise<string> {
    const docRef = await addDoc(this.materialesCollection, {
      ...material,
      fechaCreacion: new Date().toISOString(),
    });
    return docRef.id;
  }

  async obtenerMaterialesPorClase(claseId: string): Promise<MaterialClase[]> {
    const q = query(this.materialesCollection, where('claseId', '==', claseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => MaterialClase.fromFirestore(docSnap.data(), docSnap.id));
  }

  async actualizarMaterial(id: string, datos: Partial<Omit<MaterialClase, 'id' | 'claseId'>>): Promise<void> {
    const ref = doc(this.firestore, `materiales-clase/${id}`);
    await updateDoc(ref, datos as any);
  }

  async eliminarMaterial(id: string): Promise<void> {
    const ref = doc(this.firestore, `materiales-clase/${id}`);
    await deleteDoc(ref);
  }
}
