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
  public usuario$ = this.usuarioActual.asObservable();
  isLoggedIn$: Observable<Boolean> = this.usuario$.pipe(map(Boolean));
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
        try {
          const rol = await this.usuarioService.obtenerRolUsuario(user.uid);
          console.log('✅ Rol cargado:', rol, 'para usuario:', user.email);
          this.rolUsuario.next(rol);
        } catch (error) {
          console.error('❌ Error al obtener rol:', error);
          this.rolUsuario.next(null);
        }
      } else {
        this.rolUsuario.next(null);
      }
      this.authInitialized.next(true);
    });
  }

  // ✅ Verifica si un correo ya está registrado
  async correoYaExiste(email: string): Promise<boolean> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // ✅ Registro de usuario (DESHABILITADO - Solo admins pueden crear cuentas)
  /**
   * @deprecated Desde 09/12/2025, el registro público está deshabilitado.
   * Solo los administradores pueden crear cuentas de usuario a través de AdminService.
   * Este método rechazará cualquier intento de registro.
   */
  async signUpEmailAndPassword(
    email: string,
    password: string,
    nombre: string
  ) {
    throw new Error(
      '❌ El registro público ha sido deshabilitado. Solo los administradores pueden crear cuentas. Contacta con el administrador.'
    );
  }

  // ✅ Login con correo y contraseña
  loginConEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Login con Google
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
        toFirestore() {
          return {
            uid: this.uid,
            nombre: this.nombre,
            email: this.email,
            rol: this.rol,
            fotoUrl: this.fotoUrl,
            fechaRegistro: this.fechaRegistro,
          };
        },
      };

      await this.usuarioService.crearUsuario(usuario);
      return usuario;
    }

    return null;
  }

  // ✅ Login con Facebook
  async loginConFacebook() {
    const provider = new FacebookAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

  // ✅ Logout
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // ✅ Observable del usuario actual
  getUserObservable(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // ✅ UID del usuario actual
  async getUserId(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // ✅ Datos del usuario desde Firestore
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

  // ✅ 🔍 Obtener usuario por su UID
  async getUsuarioPorUid(uid: string): Promise<Usuario | null> {
    try {
      const userDoc = doc(this.firestore, `usuarios/${uid}`);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return Usuario.fromFirestore(data, uid);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener usuario por UID:', error);
      return null;
    }
  }

  /**
   * Devuelve el rol del usuario actual (o null si no existe)
   */
  async getRole(): Promise<string | null> {
    const uid = await this.getUserId();
    if (!uid) return null;
    return await this.usuarioService.obtenerRolUsuario(uid);
  }

  /**
   * Indica si el usuario actual es admin
   */
  async isAdmin(): Promise<boolean> {
    const rol = await this.getRole();
    return rol === 'admin';
  }
}
