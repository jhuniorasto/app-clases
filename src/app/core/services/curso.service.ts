import { Injectable } from '@angular/core';
import { Firestore, query, where } from '@angular/fire/firestore';
import { Curso } from '../models/curso.model';
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  getCollectionRef,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  serializeDates,
  handleFirestoreError,
} from '../data/firestore.utils';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private readonly COLLECTION_PATH = 'cursos';
  private cursosCollection;

  constructor(private firestore: Firestore) {
    this.cursosCollection = getCollectionRef(
      this.firestore,
      this.COLLECTION_PATH
    );
  }

  // ✅ Crear curso
  async crearCurso(curso: Omit<Curso, 'id'>): Promise<string> {
    try {
      const serialized = serializeDates(curso, ['fechaCreacion']);
      return await createDocument(this.cursosCollection, serialized);
    } catch (error) {
      handleFirestoreError(error, 'crear curso');
    }
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
    try {
      return await getDocumentById(
        this.firestore,
        this.COLLECTION_PATH,
        id,
        (data, id) => Curso.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener curso por ID');
    }
  }

  // ✅ Actualizar curso
  async actualizarCurso(
    id: string,
    datos: Partial<Omit<Curso, 'id' | 'creadoPorUid'>>
  ): Promise<void> {
    try {
      await updateDocument(this.firestore, this.COLLECTION_PATH, id, datos);
    } catch (error) {
      handleFirestoreError(error, 'actualizar curso');
    }
  }

  // ✅ Eliminar curso
  async eliminarCurso(id: string): Promise<void> {
    try {
      await deleteDocument(this.firestore, this.COLLECTION_PATH, id);
    } catch (error) {
      handleFirestoreError(error, 'eliminar curso');
    }
  }
}
