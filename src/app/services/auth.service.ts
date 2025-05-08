import { Injectable, inject } from '@angular/core';
import {
  Auth, //Funcionalidad de autenticación de Firebase
  GoogleAuthProvider, // Clase para autenticarse con Google
  createUserWithEmailAndPassword, //Función para registrar un nuevo usuario
  FacebookAuthProvider, //  Clase para autenticarse con Facebook
  signInWithEmailAndPassword, //Función para login con email y contraseña
  signInWithPopup,//	Función para login con Google/Facebook usando una ventana emergente
  signOut, //Función para cerrar sesión
  onAuthStateChanged,
  User,
} from '@angular/fire/auth'; // Auth es una clase que forma parte de la librería @angular/fire/auth, y representa toda la funcionalidad de autenticación que ofrece Firebase, 
import { error } from 'console';

@Injectable({
  providedIn: 'root', //Se declara como inyectable en toda la app 
})

export class AuthService {
  constructor(private auth: Auth) {} // Se inyecta el servicio de autenticación de Firebase

  // inicia sesión en Firebase usando un correo y una contraseña.
  loginConEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password); // Devuelve una promesa que se resuelve cuando el inicio de sesión es exitoso  
  }

  //Registrar a un nuevo usuario con correo y contraseña.
  signUpEmailAndPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password).then(
        userCredential => 
          // Se resuelve la promesa con el objeto de credenciales del usuario
          resolve(userCredential),
        error =>
          // Si hay un error, se rechaza la promesa y se devuelve el error.
          reject(error)
      );
    });
  }
 
  // Abre una ventana emergente para iniciar sesión con Google.
  loginConGoogle() {
    const provider = new GoogleAuthProvider(); //Usa el proveedor GoogleAuthProvider de Firebase.
    return signInWithPopup(this.auth, provider);
  }

  loginConFacebook() {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  
  async getUserId(): Promise<string | null> {
    const user = this.auth.currentUser; //Obtiene el usuario actual de Firebase.
    return user ? user.uid : null; //Devuelve el ID del usuario o null si no hay un usuario autenticado.
  }

  logout(): Promise<void> {
    return signOut(this.auth); // Cierra la sesión del usuario actual en Firebase.
  }

  getUserObservable(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback); //	Escuchar cambios en la sesión del usuario
  }
}
