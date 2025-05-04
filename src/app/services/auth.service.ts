import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  loginConEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUpEmailAndPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password).then(
        userCredential =>
          // User signed up successfully
          resolve(userCredential),
        error =>
          // Handle sign-up error
          reject(error)
      );
    });
  }

  loginConGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  loginConFacebook() {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async getUserId(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  getUserObservable(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }
}
