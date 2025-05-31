import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from './usuario.service';
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
  private usuarioActual = new BehaviorSubject<User | null>(null);
  public usuario$ = this.usuarioActual.asObservable(); // ⬅️ Usaremos esta en el componente
  isLoggedIn$: Observable<Boolean> = this.usuario$.pipe(map(Boolean)); // Estado de autenticación
  private authInitialized = new BehaviorSubject<boolean>(false);
  public authInitialized$ = this.authInitialized.asObservable();
  private rolUsuario = new BehaviorSubject<string | null>(null);
  public rol$ = this.rolUsuario.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private usuarioService: UsuarioService
  ) {
    onAuthStateChanged(this.auth, async (user) => {
      this.usuarioActual.next(user);
      if (user) {
        const rol = await this.usuarioService.obtenerRolUsuario(user.uid);
        this.rolUsuario.next(rol);
      } else {
        this.rolUsuario.next(null);
      }
      this.authInitialized.next(true); // ⚠️ Marcar como inicializado
    });
  }
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

      // Usar UsuarioService para crear el usuario en la colección
      await this.usuarioService.crearUsuario({
        uid: user.uid,
        email: user.email || '',
        nombre: nombre,
        rol: 'docente',
        fechaRegistro: new Date(),
        fotoUrl: user.photoURL || '',
      });

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


async loginConGoogle(): Promise<Usuario | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(this.auth, provider);
  const user = result.user;

  if (user) {
    const usuario: Usuario = {
      uid: user.uid,
      nombre: user.displayName || '',
      email: user.email || '',
      fechaRegistro: new Date(),
      rol: 'estudiante',
      fotoUrl: user.photoURL || '',
    };

    await this.usuarioService.crearUsuario(usuario);
    return usuario; // ✅ devuelve el usuario
  }

  return null; // ✅ si no se pudo obtener el usuario
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
