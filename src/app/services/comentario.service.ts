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
  orderBy,
} from '@angular/fire/firestore';
import { Comentario } from '../models/comentario.model'; // Asegúrate de tener esta ruta correcta
import { collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  private comentariosCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.comentariosCollection = collection(this.firestore, 'comentarios');
  }

  // ✅ Crear nuevo comentario
  async crearComentario(comentario: Omit<Comentario, 'id'>): Promise<string> {
    const docRef = await addDoc(this.comentariosCollection, {
      ...comentario,
      fecha: comentario.fecha.toISOString(), // guardamos como string ISO
      usuarioNombre: comentario.usuarioNombre, // nuevo
    });
    return docRef.id;
  }

  // ✅ Obtener todos los comentarios de una clase
  obtenerComentariosPorClase(claseId: string): Observable<Comentario[]> {
    const q = query(
      this.comentariosCollection,
      where('claseId', '==', claseId),
      orderBy('fecha') // ✅ Orden ascendente por fecha
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((docs: any[]) =>
        docs.map((doc) => Comentario.fromFirestore(doc, doc.id))
      )
    );
  }

  // ✅ Obtener un comentario específico por ID
  async obtenerComentarioPorId(id: string): Promise<Comentario | null> {
    const comentarioRef = doc(this.firestore, `comentarios/${id}`);
    const snap = await getDoc(comentarioRef);
    if (!snap.exists()) return null;
    return Comentario.fromFirestore(snap.data(), snap.id);
  }

  // ✅ Actualizar comentario (por si permites editar)
  async actualizarComentario(id: string, contenido: string): Promise<void> {
    const comentarioRef = doc(this.firestore, `comentarios/${id}`);
    await updateDoc(comentarioRef, {
      contenido,
      fecha: new Date().toISOString(),
    });
  }

  // ✅ Eliminar comentario
  async eliminarComentario(id: string): Promise<void> {
    const comentarioRef = doc(this.firestore, `comentarios/${id}`);
    await deleteDoc(comentarioRef);
  }
}
