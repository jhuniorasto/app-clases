import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  writeBatch,
  collectionData,
} from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  User,
} from '@angular/fire/auth';
import { Usuario, UserRole, UsuarioEstado } from '../models/usuario.model';
import { UsuarioService } from './usuario.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private usuariosCollection: ReturnType<typeof collection>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private usuarioService: UsuarioService
  ) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
  }

  // ============================================================
  // 🔹 GESTIÓN DE USUARIOS (RF 01 - Gestión de cuentas)
  // ============================================================

  /**
   * Obtiene todos los usuarios con filtro por rol
   * @param rol - Filtro opcional por rol (estudiante, docente, admin)
   */
  async obtenerUsuarioPorRol(rol?: UserRole): Promise<Usuario[]> {
    try {
      let q: ReturnType<typeof collection> | ReturnType<typeof query> =
        this.usuariosCollection;
      if (rol) {
        q = query(this.usuariosCollection, where('rol', '==', rol));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) =>
        Usuario.fromFirestore(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los estudiantes
   */
  async obtenerEstudiantes(): Promise<Usuario[]> {
    return this.obtenerUsuarioPorRol('estudiante');
  }

  /**
   * Obtiene todos los docentes
   */
  async obtenerDocentes(): Promise<Usuario[]> {
    return this.obtenerUsuarioPorRol('docente');
  }

  /**
   * Crea una nueva cuenta de usuario (estudiante o docente)
   * Solo el admin puede hacer esto
   * RF 01, RF 04, RF 05
   */
  async crearCuentaUsuario(usuario: {
    nombre: string;
    email: string;
    password: string;
    rol: 'estudiante' | 'docente';
    especialidad?: string;
    numeroEstudiante?: string;
  }): Promise<Usuario> {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        usuario.email,
        usuario.password
      );

      // 2. Crear documento en Firestore
      const nuevoUsuario: Usuario = new Usuario(
        userCredential.user.uid,
        usuario.nombre,
        usuario.email,
        usuario.rol,
        '',
        new Date(),
        { activo: true },
        usuario.especialidad,
        usuario.numeroEstudiante
      );

      await this.usuarioService.crearUsuario(nuevoUsuario);
      return nuevoUsuario;
    } catch (error: any) {
      console.error('Error al crear cuenta de usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza información de un usuario
   * RF 04, RF 05
   */
  async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<void> {
    try {
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(userRef, datos);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Desactiva una cuenta de usuario (soft delete)
   * RF 01
   */
  async desactivarUsuario(uid: string, razon?: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      const estado: UsuarioEstado = {
        activo: false,
        razonDesactivacion: razon,
        fechaDesactivacion: new Date(),
      };
      await updateDoc(userRef, { estado });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      throw error;
    }
  }

  /**
   * Reactiva una cuenta de usuario desactivada
   * RF 01
   */
  async reactivarUsuario(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      const estado: UsuarioEstado = { activo: true };
      await updateDoc(userRef, { estado });
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina completamente un usuario (hard delete)
   * RF 01
   */
  async eliminarUsuario(uid: string): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);

      // Eliminar documento de Firestore
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      batch.delete(userRef);

      // Eliminar inscripciones asociadas
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const q = query(inscripcionesRef, where('estudianteUid', '==', uid));
      const inscripciones = await getDocs(q);

      inscripciones.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Ejecutar batch
      await batch.commit();

      // Nota: La eliminación en Firebase Auth debe hacerse por separado si es necesario
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Busca usuarios por nombre o email
   */
  async buscarUsuarios(termino: string): Promise<Usuario[]> {
    try {
      // Búsqueda simple (Firestore no soporta búsqueda de texto completo sin extensiones)
      const usuarios = await this.obtenerUsuarioPorRol();
      return usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          u.email.toLowerCase().includes(termino.toLowerCase())
      );
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  // ============================================================
  // 🔹 GESTIÓN DE CURSOS (RF 03)
  // ============================================================

  /**
   * Asigna un docente a un curso
   */
  async asignarDocenteACurso(
    cursoId: string,
    docenteUid: string
  ): Promise<void> {
    try {
      const cursoRef = doc(this.firestore, `cursos/${cursoId}`);
      await updateDoc(cursoRef, { creadoPorUid: docenteUid });
    } catch (error) {
      console.error('Error al asignar docente al curso:', error);
      throw error;
    }
  }

  /**
   * Obtiene cursos sin docente asignado
   */
  async obtenerCursosSinDocente(): Promise<any[]> {
    try {
      const cursosRef = collection(this.firestore, 'cursos');
      const q = query(cursosRef, where('creadoPorUid', '==', ''));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener cursos sin docente:', error);
      throw error;
    }
  }

  // ============================================================
  // 🔹 GESTIÓN DE INSCRIPCIONES (RF 06)
  // ============================================================

  /**
   * Inscribe un estudiante en un curso
   * RF 06 - Solo el admin puede hacer esto
   */
  async inscribirEstudianteEnCurso(
    estudianteUid: string,
    cursoId: string
  ): Promise<void> {
    try {
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      await addDoc(inscripcionesRef, {
        estudianteUid,
        cursoId,
        fechaInscripcion: new Date(),
      });
    } catch (error) {
      console.error('Error al inscribir estudiante en curso:', error);
      throw error;
    }
  }

  /**
   * Desinscribe un estudiante de un curso
   * RF 06
   */
  async desinscribirEstudianteDelCurso(
    estudianteUid: string,
    cursoId: string
  ): Promise<void> {
    try {
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const q = query(
        inscripcionesRef,
        where('estudianteUid', '==', estudianteUid),
        where('cursoId', '==', cursoId)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => deleteDoc(doc.ref));
    } catch (error) {
      console.error('Error al desinscribir estudiante del curso:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los estudiantes inscritos en un curso
   */
  async obtenerEstudiantesDelCurso(cursoId: string): Promise<Usuario[]> {
    try {
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const q = query(inscripcionesRef, where('cursoId', '==', cursoId));
      const snapshot = await getDocs(q);

      const usuariosPromesas = snapshot.docs.map((doc) => {
        const estudianteUid = doc.data()['estudianteUid'];
        return this.usuarioService.obtenerUsuarioPorUid(estudianteUid);
      });

      const usuarios = await Promise.all(usuariosPromesas);
      return usuarios.filter((u) => u !== null) as Usuario[];
    } catch (error) {
      console.error('Error al obtener estudiantes del curso:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los cursos (id + datos)
   */
  async obtenerCursos(): Promise<Array<{ id: string; [key: string]: any }>> {
    try {
      const cursosRef = collection(this.firestore, 'cursos');
      const snapshot = await getDocs(cursosRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las inscripciones y las enriquece con datos de estudiante y curso
   */
  async obtenerInscripciones(): Promise<
    Array<{
      id: string;
      estudianteUid: string;
      cursoId: string;
      fechaInscripcion: any;
      estudiante?: Usuario | null;
      curso?: { id: string; [key: string]: any } | null;
    }>
  > {
    try {
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const snapshot = await getDocs(inscripcionesRef);

      const resultados = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const estudianteUid = data['estudianteUid'];
          const cursoId = data['cursoId'];

          // Obtener estudiante
          const estudiante = await this.usuarioService.obtenerUsuarioPorUid(
            estudianteUid
          );

          // Obtener curso
          const cursoRef = doc(this.firestore, `cursos/${cursoId}`);
          let cursoData: any = null;
          try {
            const cursoSnap = await getDoc(cursoRef);
            if (cursoSnap.exists())
              cursoData = { id: cursoSnap.id, ...cursoSnap.data() };
          } catch (e) {
            console.warn('No se pudo obtener datos del curso', cursoId, e);
          }

          return {
            id: docSnap.id,
            estudianteUid,
            cursoId,
            fechaInscripcion: data['fechaInscripcion'],
            estudiante,
            curso: cursoData,
          };
        })
      );

      return resultados;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  }

  // ============================================================
  //   GESTIÓN DE HORARIOS (RF 07)
  // ============================================================

  /**
   * Crea un horario para un curso
   * RF 07
   */
  async crearHorario(horario: {
    cursoId: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
    docenteUid?: string;
  }): Promise<string> {
    try {
      const horariosRef = collection(this.firestore, 'horarios');
      const docRef = await addDoc(horariosRef, {
        ...horario,
        fechaCreacion: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear horario:', error);
      throw error;
    }
  }

  /**
   * Obtiene horarios de un curso
   * RF 07
   */
  async obtenerHorariosDeCurso(cursoId: string): Promise<any[]> {
    try {
      const horariosRef = collection(this.firestore, 'horarios');
      const q = query(horariosRef, where('cursoId', '==', cursoId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener horarios del curso:', error);
      throw error;
    }
  }

  /**
   * Actualiza un horario
   * RF 07
   */
  async actualizarHorario(
    horarioId: string,
    datos: Partial<any>
  ): Promise<void> {
    try {
      const horarioRef = doc(this.firestore, `horarios/${horarioId}`);
      await updateDoc(horarioRef, datos);
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      throw error;
    }
  }

  /**
   * Elimina un horario
   * RF 07
   */
  async eliminarHorario(horarioId: string): Promise<void> {
    try {
      const horarioRef = doc(this.firestore, `horarios/${horarioId}`);
      await deleteDoc(horarioRef);
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      throw error;
    }
  }

  // ============================================================
  // 🔹 ESTADÍSTICAS Y REPORTES
  // ============================================================

  /**
   * Obtiene estadísticas generales del sistema
   */
  async obtenerEstadisticas(): Promise<{
    totalEstudiantes: number;
    totalDocentes: number;
    totalCursos: number;
    totalInscripciones: number;
  }> {
    try {
      const estudiantes = await this.obtenerEstudiantes();
      const docentes = await this.obtenerDocentes();
      const cursosRef = collection(this.firestore, 'cursos');
      const cursos = await getDocs(cursosRef);
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const inscripciones = await getDocs(inscripcionesRef);

      return {
        totalEstudiantes: estudiantes.length,
        totalDocentes: docentes.length,
        totalCursos: cursos.size,
        totalInscripciones: inscripciones.size,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}
