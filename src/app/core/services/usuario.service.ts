import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, CollectionReference, where } from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import {
  getCollectionRef,
  getDocumentById,
  setDocument,
  updateDocument,
  queryDocuments,
  handleFirestoreError,
  getAllDocuments,
  serializeDates,
} from '../data/firestore.utils';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuariosCollection: CollectionReference;
  private readonly COLLECTION_PATH = 'usuarios';

  constructor(private firestore: Firestore, private auth: Auth) {
    this.usuariosCollection = getCollectionRef(
      this.firestore,
      this.COLLECTION_PATH
    );
  }

  // 🔒 1. Obtener datos del usuario por UID (para mostrar perfil o datos del estudiante/docente)
  async obtenerUsuarioPorUid(uid: string): Promise<Usuario | null> {
    try {
      return await getDocumentById(
        this.firestore,
        this.COLLECTION_PATH,
        uid,
        (data, id) => Usuario.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener usuario por UID');
    }
  }

  // 👤 2. Crear usuario (usado justo después del registro con cuenta Google)
  async crearUsuario(usuario: Usuario): Promise<void> {
    try {
      const payload = serializeDates(usuario as any, ['fechaRegistro']);
      await setDocument(this.firestore, this.COLLECTION_PATH, usuario.uid, {
        uid: usuario.uid,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fechaRegistro: payload['fechaRegistro'],
        fotoUrl: usuario.fotoUrl || null,
      });
    } catch (error) {
      handleFirestoreError(error, 'crear usuario');
    }
  }

  // ✏️ 3. Actualizar datos del usuario (perfil, rol si se autoriza desde admin)
  async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<void> {
    try {
      await updateDocument(this.firestore, this.COLLECTION_PATH, uid, datos);
    } catch (error) {
      handleFirestoreError(error, 'actualizar usuario');
    }
  }

  // 📧 4. Verificar si un correo ya existe (útil en validaciones personalizadas)
  async correoYaExiste(email: string): Promise<boolean> {
    try {
      const results = await queryDocuments(
        this.usuariosCollection,
        [where('email', '==', email)],
        (data) => data
      );
      return results.length > 0;
    } catch (error) {
      handleFirestoreError(error, 'verificar existencia de correo');
    }
  }

  // 👥 5. Obtener todos los estudiantes (para módulo profesor / admin)
  async obtenerEstudiantes(): Promise<Usuario[]> {
    try {
      return await queryDocuments(
        this.usuariosCollection,
        [where('rol', '==', 'estudiante')],
        (data, id) => Usuario.fromFirestore(data, id)
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener estudiantes');
    }
  }

  // 🧑‍🏫 6. Obtener todos los profesores (para asignar cursos o responder comentarios)

  async obtenerProfesores(): Promise<Usuario[]> {
    try {
      const profesoresRef = getCollectionRef(this.firestore, 'profesores');
      return await getAllDocuments(profesoresRef, (data, id) =>
        Usuario.fromFirestore(
          {
            uid: id,
            nombre: data['nombre'] ?? '',
            email: '',
            rol: 'docente',
            fotoUrl: data['imagenUrl'] ?? '',
            fechaRegistro: undefined,
          },
          id
        )
      );
    } catch (error) {
      handleFirestoreError(error, 'obtener profesores');
    }
  }

  // 🔎 7. Buscar usuario por email (por si se necesita en el futuro)
  async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
    try {
      const results = await queryDocuments(
        this.usuariosCollection,
        [where('email', '==', email)],
        (data, id) => Usuario.fromFirestore(data, id)
      );
      return results.length ? results[0] : null;
    } catch (error) {
      handleFirestoreError(error, 'buscar usuario por email');
    }
  }

  async obtenerRolUsuario(uid: string): Promise<string | null> {
    try {
      const usuario = await this.obtenerUsuarioPorUid(uid);
      return usuario?.rol || null;
    } catch (error) {
      handleFirestoreError(error, 'obtener rol de usuario');
    }
  }

  async obtenerUsuarioActual(): Promise<Usuario | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await this.obtenerUsuarioPorUid(user.uid); // Reutiliza tu método existente
  }
}
