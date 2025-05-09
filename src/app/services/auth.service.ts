import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // Verifica si un correo ya está registrado en Firestore
  async correoYaExiste(email: string): Promise<boolean> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Registro con correo, contraseña y nombre (rol fijo: docente)
  async signUpEmailAndPassword(
    email: string,
    password: string,
    nombre: string
  ) {
    try {
      const existe = await this.correoYaExiste(email);
      if (existe) {
        throw new Error('El correo ya está registrado en la base de datos.');
      }

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          nombre: nombre,
          rol: 'docente',
          fechaRegistro: new Date(),
        },
        { merge: true }
      );

      return userCredential;
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Login con correo y contraseña
  loginConEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Login con Google (sin guardar datos por ahora)
  loginConGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async loginConFacebook() {
    const provider = new FacebookAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

  // Cierra sesión
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // Obtener observable del usuario actual
  getUserObservable(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Obtener el UID del usuario autenticado
  async getUserId(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // Obtener datos del usuario desde Firestore
  async getUserData(): Promise<any> {
    const uid = await this.getUserId();
    if (!uid) return null;

    const userDoc = doc(this.firestore, `usuarios/${uid}`);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  }
}
