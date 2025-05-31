import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
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

  constructor(private firestore: Firestore, private auth: Auth) {
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
      uid: usuario.uid,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      fechaRegistro: usuario.fechaRegistro,
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
    const profesoresRef = collection(this.firestore, 'profesores');
    const snapshot = await getDocs(profesoresRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        uid: doc.id,
        nombre: data['nombre'] ?? '',
        email: '', // no existe en los documentos actuales
        rol: 'docente', // asumido
        fotoUrl: data['imagenUrl'] ?? '', // usa imagenUrl de Firebase
        fechaRegistro: undefined
      };
    });
  }

  // 🔎 7. Buscar usuario por email (por si se necesita en el futuro)
  async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
    const q = query(this.usuariosCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return Usuario.fromFirestore(docSnap.data(), docSnap.id);
  }

  async obtenerRolUsuario(uid: string): Promise<string | null> {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data()?.['rol'] || null;
  }

  async obtenerUsuarioActual(): Promise<Usuario | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await this.obtenerUsuarioPorUid(user.uid); // Reutiliza tu método existente
  }
}