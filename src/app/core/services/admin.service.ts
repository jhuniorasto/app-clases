import { Injectable } from '@angular/core';
import {
  Firestore,
  where,
  writeBatch,
  doc,
  CollectionReference,
} from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Usuario, UserRole, UsuarioEstado } from '../models/usuario.model';
import { UsuarioService } from './usuario.service';
import { Horario } from '../models/horario.model';
import {
  getCollectionRef,
  queryDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  handleFirestoreError,
  getAllDocuments,
  serializeDates,
  getDocumentById,
} from '../data/firestore.utils';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private usuariosCollection: CollectionReference;
  private inscripcionesCollection: CollectionReference;
  private cursosCollection: CollectionReference;
  private horariosCollection: CollectionReference;

  private readonly USERS_PATH = 'usuarios';
  private readonly INSCRIPCIONES_PATH = 'inscripciones';
  private readonly CURSOS_PATH = 'cursos';
  private readonly HORARIOS_PATH = 'horarios';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private usuarioService: UsuarioService
  ) {
    this.usuariosCollection = getCollectionRef(this.firestore, this.USERS_PATH);
    this.inscripcionesCollection = getCollectionRef(
      this.firestore,
      this.INSCRIPCIONES_PATH
    );
    this.cursosCollection = getCollectionRef(this.firestore, this.CURSOS_PATH);
    this.horariosCollection = getCollectionRef(
      this.firestore,
      this.HORARIOS_PATH
    );
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
      const constraints = rol ? [where('rol', '==', rol)] : [];
      return await queryDocuments(
        this.usuariosCollection,
        constraints,
        (data, id) => Usuario.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener usuarios por rol');
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
      await updateDocument(this.firestore, this.USERS_PATH, uid, datos);
    } catch (error) {
      handleFirestoreError(error, 'actualizar usuario');
    }
  }

  /**
   * Desactiva una cuenta de usuario (soft delete)
   * RF 01
   */
  async desactivarUsuario(uid: string, razon?: string): Promise<void> {
    try {
      const estado: UsuarioEstado = {
        activo: false,
        razonDesactivacion: razon,
        fechaDesactivacion: new Date(),
      };
      await updateDocument(this.firestore, this.USERS_PATH, uid, { estado });
    } catch (error) {
      handleFirestoreError(error, 'desactivar usuario');
    }
  }

  /**
   * Reactiva una cuenta de usuario desactivada
   * RF 01
   */
  async reactivarUsuario(uid: string): Promise<void> {
    try {
      const estado: UsuarioEstado = { activo: true };
      await updateDocument(this.firestore, this.USERS_PATH, uid, { estado });
    } catch (error) {
      handleFirestoreError(error, 'reactivar usuario');
    }
  }

  /**
   * Elimina completamente un usuario (hard delete)
   * RF 01
   */
  async eliminarUsuario(uid: string): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);

      // Eliminar documento de usuario
      const userRef = doc(this.firestore, `${this.USERS_PATH}/${uid}`);
      batch.delete(userRef);

      // Eliminar inscripciones asociadas
      const inscripciones = await queryDocuments(
        this.inscripcionesCollection,
        [where('estudianteUid', '==', uid)],
        (data, id) => ({ id })
      );

      inscripciones.forEach((inscripcion) => {
        const ref = doc(
          this.firestore,
          `${this.INSCRIPCIONES_PATH}/${inscripcion.id}`
        );
        batch.delete(ref);
      });

      // Ejecutar batch
      await batch.commit();

      // Nota: La eliminación en Firebase Auth debe hacerse por separado si es necesario
    } catch (error) {
      handleFirestoreError(error, 'eliminar usuario');
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
      await updateDocument(this.firestore, this.CURSOS_PATH, cursoId, {
        creadoPorUid: docenteUid,
      });
    } catch (error) {
      handleFirestoreError(error, 'asignar docente al curso');
    }
  }

  /**
   * Obtiene cursos sin docente asignado
   */
  async obtenerCursosSinDocente(): Promise<any[]> {
    try {
      return await queryDocuments(
        this.cursosCollection,
        [where('creadoPorUid', '==', '')],
        (data, id) => ({ id, ...data })
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener cursos sin docente');
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
    cursoId: string,
    scheduleId: string
  ): Promise<void> {
    try {
      const data = serializeDates(
        {
          estudianteUid,
          cursoId,
          scheduleId,
          fechaInscripcion: new Date(),
        },
        ['fechaInscripcion']
      );
      await createDocument(this.inscripcionesCollection, data);
    } catch (error) {
      handleFirestoreError(error, 'inscribir estudiante en curso');
    }
  }

  /**
   * Desinscribe un estudiante de un curso
   * RF 06
   */
  async desinscribirEstudianteDelCurso(
    estudianteUid: string,
    cursoId: string,
    scheduleId?: string
  ): Promise<void> {
    try {
      const constraints = [
        where('estudianteUid', '==', estudianteUid),
        where('cursoId', '==', cursoId),
      ];
      if (scheduleId) {
        constraints.push(where('scheduleId', '==', scheduleId));
      }

      const inscripciones = await queryDocuments(
        this.inscripcionesCollection,
        constraints,
        (data, id) => ({ id, ...data })
      );
      for (const inscripcion of inscripciones) {
        await deleteDocument(
          this.firestore,
          this.INSCRIPCIONES_PATH,
          inscripcion.id
        );
      }
    } catch (error) {
      handleFirestoreError(error, 'desinscribir estudiante del curso');
    }
  }

  /**
   * Verifica si un estudiante ya está inscrito en un curso
   * @returns true si ya existe la inscripción
   */
  async verificarInscripcionExistente(
    estudianteUid: string,
    cursoId: string
  ): Promise<boolean> {
    try {
      const results = await queryDocuments(
        this.inscripcionesCollection,
        [
          where('estudianteUid', '==', estudianteUid),
          where('cursoId', '==', cursoId),
        ],
        (data, id) => ({ id, ...data })
      );
      return results.length > 0;
    } catch (error) {
      handleFirestoreError(error, 'verificar inscripción existente');
    }
  }

  /**
   * Obtiene inscripciones filtradas por curso
   */
  async obtenerInscripcionesPorCurso(cursoId: string): Promise<
    Array<{
      id: string;
      estudianteUid: string;
      cursoId: string;
      fechaInscripcion: any;
      scheduleId?: string;
      estudiante?: Usuario | null;
      horario?: Horario | null;
    }>
  > {
    try {
      const inscripciones = await queryDocuments(
        this.inscripcionesCollection,
        [where('cursoId', '==', cursoId)],
        (data, id) => ({ id, ...data })
      );

      const resultados = await Promise.all(
        inscripciones.map(async (inscripcion) => {
          const estudiante = await this.usuarioService.obtenerUsuarioPorUid(
            inscripcion.estudianteUid
          );
          let horario: Horario | null = null;
          if (inscripcion.scheduleId) {
            horario = (await getDocumentById(
              this.firestore,
              this.HORARIOS_PATH,
              inscripcion.scheduleId,
              (data, id) => ({ id, ...data })
            )) as Horario | null;
          }
          return {
            ...inscripcion,
            estudiante,
            horario,
          };
        })
      );

      return resultados;
    } catch (error) {
      handleFirestoreError(error, 'obtener inscripciones por curso');
    }
  }

  /**
   * Obtiene inscripciones filtradas por estudiante
   */
  async obtenerInscripcionesPorEstudiante(estudianteUid: string): Promise<
    Array<{
      id: string;
      estudianteUid: string;
      cursoId: string;
      fechaInscripcion: any;
      scheduleId?: string;
      curso?: { id: string; [key: string]: any } | null;
      horario?: Horario | null;
    }>
  > {
    try {
      const inscripciones = await queryDocuments(
        this.inscripcionesCollection,
        [where('estudianteUid', '==', estudianteUid)],
        (data, id) => ({ id, ...data })
      );

      const resultados = await Promise.all(
        inscripciones.map(async (inscripcion) => {
          let cursoData: any = null;
          try {
            cursoData = await getDocumentById(
              this.firestore,
              this.CURSOS_PATH,
              inscripcion.cursoId,
              (data, id) => ({ id, ...data })
            );
          } catch (e) {
            console.warn(
              'No se pudo obtener datos del curso',
              inscripcion.cursoId
            );
          }

          let horario: Horario | null = null;
          if (inscripcion.scheduleId) {
            horario = (await getDocumentById(
              this.firestore,
              this.HORARIOS_PATH,
              inscripcion.scheduleId,
              (data, id) => ({ id, ...data })
            )) as Horario | null;
          }

          return {
            ...inscripcion,
            curso: cursoData,
            horario,
          };
        })
      );

      return resultados;
    } catch (error) {
      handleFirestoreError(error, 'obtener inscripciones por estudiante');
    }
  }

  /**
   * Obtiene todos los estudiantes inscritos en un curso
   */
  async obtenerEstudiantesDelCurso(cursoId: string): Promise<Usuario[]> {
    try {
      const inscripciones = await queryDocuments(
        this.inscripcionesCollection,
        [where('cursoId', '==', cursoId)],
        (data, id) => ({ id, ...data })
      );

      const usuariosPromesas = inscripciones.map((inscripcion) =>
        this.usuarioService.obtenerUsuarioPorUid(inscripcion.estudianteUid)
      );

      const usuarios = await Promise.all(usuariosPromesas);
      return usuarios.filter((u) => u !== null) as Usuario[];
    } catch (error) {
      handleFirestoreError(error, 'obtener estudiantes del curso');
    }
  }

  /**
   * Obtiene todos los cursos (id + datos)
   */
  async obtenerCursos(): Promise<Array<{ id: string; [key: string]: any }>> {
    try {
      return await getAllDocuments(this.cursosCollection, (data, id) => ({
        id,
        ...data,
      }));
    } catch (error) {
      handleFirestoreError(error, 'obtener cursos');
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
      scheduleId?: string;
      estudiante?: Usuario | null;
      curso?: { id: string; [key: string]: any } | null;
      horario?: Horario | null;
    }>
  > {
    try {
      const inscripciones = await getAllDocuments(
        this.inscripcionesCollection,
        (data, id) => ({ id, ...data })
      );

      const resultados = await Promise.all(
        inscripciones.map(async (inscripcion) => {
          const estudiante = await this.usuarioService.obtenerUsuarioPorUid(
            inscripcion.estudianteUid
          );
          let cursoData: any = null;
          try {
            cursoData = await getDocumentById(
              this.firestore,
              this.CURSOS_PATH,
              inscripcion.cursoId,
              (data, id) => ({ id, ...data })
            );
          } catch (e) {
            console.warn(
              'No se pudo obtener datos del curso',
              inscripcion.cursoId,
              e
            );
          }

          let horario: Horario | null = null;
          if (inscripcion.scheduleId) {
            horario = (await getDocumentById(
              this.firestore,
              this.HORARIOS_PATH,
              inscripcion.scheduleId,
              (data, id) => ({ id, ...data })
            )) as Horario | null;
          }

          return {
            ...inscripcion,
            estudiante,
            curso: cursoData,
            horario,
          };
        })
      );

      return resultados;
    } catch (error) {
      handleFirestoreError(error, 'obtener inscripciones');
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
      const payload = serializeDates(
        { ...horario, fechaCreacion: new Date() },
        ['fechaCreacion']
      );
      return await createDocument(this.horariosCollection, payload);
    } catch (error) {
      handleFirestoreError(error, 'crear horario');
    }
  }

  /**
   * Obtiene horarios de un curso
   * RF 07
   */
  async obtenerHorariosDeCurso(cursoId: string): Promise<Horario[]> {
    try {
      return await queryDocuments(
        this.horariosCollection,
        [where('cursoId', '==', cursoId)],
        (data, id) => ({ id, ...data })
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener horarios del curso');
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
      await updateDocument(
        this.firestore,
        this.HORARIOS_PATH,
        horarioId,
        datos
      );
    } catch (error) {
      handleFirestoreError(error, 'actualizar horario');
    }
  }

  /**
   * Elimina un horario
   * RF 07
   */
  async eliminarHorario(horarioId: string): Promise<void> {
    try {
      await deleteDocument(this.firestore, this.HORARIOS_PATH, horarioId);
    } catch (error) {
      handleFirestoreError(error, 'eliminar horario');
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
      const cursos = await getAllDocuments(this.cursosCollection, (d) => d);
      const inscripciones = await getAllDocuments(
        this.inscripcionesCollection,
        (d) => d
      );

      return {
        totalEstudiantes: estudiantes.length,
        totalDocentes: docentes.length,
        totalCursos: cursos.length,
        totalInscripciones: inscripciones.length,
      };
    } catch (error) {
      handleFirestoreError(error, 'obtener estadísticas');
    }
  }
}
