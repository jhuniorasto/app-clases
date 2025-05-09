import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Curso } from '../models/curso.model'; // Ajusta si tienes otra ruta
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private cursosCollection;

  constructor(private firestore: Firestore) {
    this.cursosCollection = collection(this.firestore, 'cursos');
  }

  // ✅ Crear curso
  async crearCurso(curso: Omit<Curso, 'id'>): Promise<string> {
    const docRef = await addDoc(this.cursosCollection, {
      ...curso,
      fechaCreacion: curso.fechaCreacion.toISOString(), // guardamos en formato string
    });
    return docRef.id;
  }

  // ✅ Obtener todos los cursos
  obtenerCursos(): Observable<Curso[]> {
    return collectionData(this.cursosCollection, { idField: 'id' }).pipe(
      map((docs: any[]) => docs.map((doc) => Curso.fromFirestore(doc, doc.id)))
    );
  }

  // ✅ Obtener cursos por UID de creador
  obtenerCursosPorUsuario(uid: string): Observable<Curso[]> {
    const q = query(this.cursosCollection, where('creadoPorUid', '==', uid));
    return collectionData(q, { idField: 'id' }).pipe(
      map((docs: any[]) => docs.map((doc) => Curso.fromFirestore(doc, doc.id)))
    );
  }

  // ✅ Obtener un curso por ID
  async obtenerCursoPorId(id: string): Promise<Curso | null> {
    const cursoRef = doc(this.firestore, `cursos/${id}`);
    const snap = await getDoc(cursoRef);
    if (!snap.exists()) return null;
    return Curso.fromFirestore(snap.data(), snap.id);
  }

  // ✅ Actualizar curso
  async actualizarCurso(
    id: string,
    datos: Partial<Omit<Curso, 'id' | 'creadoPorUid'>>
  ): Promise<void> {
    const cursoRef = doc(this.firestore, `cursos/${id}`);
    await updateDoc(cursoRef, {
      ...datos,
    });
  }

  // ✅ Eliminar curso
  async eliminarCurso(id: string): Promise<void> {
    const cursoRef = doc(this.firestore, `cursos/${id}`);
    await deleteDoc(cursoRef);
  }
}
