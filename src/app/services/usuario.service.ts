import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  CollectionReference,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuariosCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
  }

  // 🔒 1. Obtener datos del usuario por UID (para mostrar perfil o datos del estudiante/docente)
  async obtenerUsuarioPorUid(uid: string): Promise<Usuario | null> {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return Usuario.fromFirestore(snap.data(), snap.id);
  }

  // 👤 2. Crear usuario (usado justo después del registro con cuenta Google)
  async crearUsuario(usuario: Usuario): Promise<void> {
    const userRef = doc(this.firestore, `usuarios/${usuario.uid}`);
    await setDoc(userRef, {
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      fotoUrl: usuario.fotoUrl || null,
    });
  }

  // ✏️ 3. Actualizar datos del usuario (perfil, rol si se autoriza desde admin)
  async actualizarUsuario(uid: string, datos: Partial<Usuario>): Promise<void> {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    await updateDoc(userRef, datos);
  }

  // 📧 4. Verificar si un correo ya existe (útil en validaciones personalizadas)
  async correoYaExiste(email: string): Promise<boolean> {
    const q = query(this.usuariosCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // 👥 5. Obtener todos los estudiantes (para módulo profesor / admin)
  async obtenerEstudiantes(): Promise<Usuario[]> {
    const q = query(this.usuariosCollection, where('rol', '==', 'estudiante'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      Usuario.fromFirestore(docSnap.data(), docSnap.id)
    );
  }

  // 🧑‍🏫 6. Obtener todos los profesores (para asignar cursos o responder comentarios)
  async obtenerProfesores(): Promise<Usuario[]> {
    const q = query(this.usuariosCollection, where('rol', '==', 'profesor'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      Usuario.fromFirestore(docSnap.data(), docSnap.id)
    );
  }

  // 🔎 7. Buscar usuario por email (por si se necesita en el futuro)
  async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
    const q = query(this.usuariosCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return Usuario.fromFirestore(docSnap.data(), docSnap.id);
  }
}
