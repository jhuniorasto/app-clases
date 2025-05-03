import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// Removed unused import as 'auth' is not exported from 'firebase/app'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {}

  loginConGoogle() {
    const provider = new GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }

  getUserId(): Promise<string | null> {
    return this.afAuth.currentUser.then(user => user?.uid || null);
  }

  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  getUserObservable() {
    return this.afAuth.authState;
  }
}
