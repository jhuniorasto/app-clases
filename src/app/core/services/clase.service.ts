import { Injectable } from '@angular/core';
import {
  Firestore,
  query,
  where,
  CollectionReference,
} from '@angular/fire/firestore';
import { Clase } from '../models/clase.model';
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
export class ClaseService {
  private readonly COLLECTION_PATH = 'clases';
  private clasesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.clasesCollection = getCollectionRef(
      this.firestore,
      this.COLLECTION_PATH
    );
  }

  // ✅ Crear una nueva clase
  async crearClase(clase: Omit<Clase, 'id'>): Promise<string> {
    try {
      const serialized = serializeDates(clase, ['fechaPublicacion']);
      return await createDocument(this.clasesCollection, serialized);
    } catch (error) {
      handleFirestoreError(error, 'crear clase');
    }
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
    try {
      return await getDocumentById(
        this.firestore,
        this.COLLECTION_PATH,
        id,
        (data, id) => Clase.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener clase por ID');
    }
  }

  // ✅ Actualizar clase
  async actualizarClase(
    id: string,
    datos: Partial<Omit<Clase, 'id' | 'cursoId'>>
  ): Promise<void> {
    try {
      await updateDocument(this.firestore, this.COLLECTION_PATH, id, datos);
    } catch (error) {
      handleFirestoreError(error, 'actualizar clase');
    }
  }

  // ✅ Eliminar clase
  async eliminarClase(id: string): Promise<void> {
    try {
      await deleteDocument(this.firestore, this.COLLECTION_PATH, id);
    } catch (error) {
      handleFirestoreError(error, 'eliminar clase');
    }
  }
}
