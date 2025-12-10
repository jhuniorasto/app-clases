import { Injectable } from '@angular/core';
import {
  Firestore,
  query,
  where,
  CollectionReference,
  setDoc,
} from '@angular/fire/firestore';
import { Inscripcion } from '../models/inscripcion.model';
import {
  getCollectionRef,
  getDocRef,
  deleteDocument,
  serializeDate,
  handleFirestoreError,
  queryDocuments,
  documentExists,
} from '../data/firestore.utils';

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
  private readonly COLLECTION_PATH = 'inscripciones';
  private inscripcionesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.inscripcionesCollection = getCollectionRef(
      this.firestore,
      this.COLLECTION_PATH
    );
  }

  // 📝 1. Inscribir a un estudiante en un curso
  async inscribirEstudiante(
    cursoId: string,
    estudianteUid: string,
    scheduleId: string = ''
  ): Promise<Inscripcion> {
    try {
      const id = `${cursoId}_${estudianteUid}`;
      const ref = getDocRef(this.firestore, `${this.COLLECTION_PATH}/${id}`);
      const data = {
        cursoId,
        estudianteUid,
        scheduleId,
        fechaInscripcion: serializeDate(new Date()),
      };
      await setDoc(ref, data);
      return Inscripcion.fromFirestore(data, id);
    } catch (error) {
      handleFirestoreError(error, 'inscribir estudiante');
    }
  }

  // 🔍 2. Verificar si un estudiante ya está inscrito en un curso
  async estaInscrito(cursoId: string, estudianteUid: string): Promise<boolean> {
    try {
      const id = `${cursoId}_${estudianteUid}`;
      return await documentExists(this.firestore, this.COLLECTION_PATH, id);
    } catch (error) {
      handleFirestoreError(error, 'verificar inscripción');
    }
  }

  // 📚 3. Obtener cursos inscritos por estudiante
  async obtenerInscripcionesPorEstudiante(
    estudianteUid: string
  ): Promise<Inscripcion[]> {
    try {
      return await queryDocuments(
        this.inscripcionesCollection,
        [where('estudianteUid', '==', estudianteUid)],
        (data, id) => Inscripcion.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener inscripciones por estudiante');
    }
  }

  // 🧑‍🎓 4. Obtener estudiantes inscritos a un curso
  async obtenerEstudiantesPorCurso(cursoId: string): Promise<Inscripcion[]> {
    try {
      return await queryDocuments(
        this.inscripcionesCollection,
        [where('cursoId', '==', cursoId)],
        (data, id) => Inscripcion.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener estudiantes por curso');
    }
  }

  // ❌ 5. Cancelar inscripción
  async cancelarInscripcion(
    cursoId: string,
    estudianteUid: string
  ): Promise<void> {
    try {
      const id = `${cursoId}_${estudianteUid}`;
      await deleteDocument(this.firestore, this.COLLECTION_PATH, id);
    } catch (error) {
      handleFirestoreError(error, 'cancelar inscripción');
    }
  }

  // 🔍 6. Obtener inscripción por curso y estudiante
  async obtenerInscripcionPorCursoYEstudiante(
    cursoId: string,
    estudianteUid: string
  ): Promise<Inscripcion | null> {
    try {
      const results = await queryDocuments(
        this.inscripcionesCollection,
        [
          where('cursoId', '==', cursoId),
          where('estudianteUid', '==', estudianteUid),
        ],
        (data, id) => Inscripcion.fromFirestore(data, id)
      );
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      handleFirestoreError(error, 'obtener inscripción por curso y estudiante');
    }
  }
}
