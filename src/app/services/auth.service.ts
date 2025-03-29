import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUserSubject.next(user);
    });
  }

  private setPersistence(rememberMe: boolean): Observable<void> {
    return from(setPersistence(
      this.auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    ));
  }

  signUp(email: string, password: string, rememberMe: boolean = false): Observable<User> {
    return this.setPersistence(rememberMe).pipe(
      switchMap(() => from(createUserWithEmailAndPassword(this.auth, email, password))),
      map(result => result.user)
    );
  }

  signIn(email: string, password: string, rememberMe: boolean = false): Observable<User> {
    return this.setPersistence(rememberMe).pipe(
      switchMap(() => from(signInWithEmailAndPassword(this.auth, email, password))),
      map(result => result.user)
    );
  }

  googleSignIn(rememberMe: boolean = false): Observable<User> {
    const provider = new GoogleAuthProvider();
    return this.setPersistence(rememberMe).pipe(
      switchMap(() => from(signInWithPopup(this.auth, provider))),
      map(result => result.user)
    );
  }

  logout() {
    return from(signOut(this.auth));
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getUserFirstName(): string | null {
    const user = this.getCurrentUser();
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return null;
  }
}
