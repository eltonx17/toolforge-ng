import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { from, Observable, ReplaySubject, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use ReplaySubject(1) to store the last known user state
  private currentUserSource = new ReplaySubject<User | null>(1);
  currentUser$ = this.currentUserSource.asObservable();

  // Add a flag to signal when the initial check is done
  private authStatusChecked = new BehaviorSubject<boolean>(false);
  authStatusChecked$ = this.authStatusChecked.asObservable();

  // Store the unsubscribe function for cleanup
  private unsubscribeAuthState: (() => void) | null = null;

  constructor(private auth: Auth) {
    this.setupAuthStateListener();
  }

  private setupAuthStateListener(): void {
    // Set up continuous auth state listener
    this.unsubscribeAuthState = this.auth.onAuthStateChanged((user) => {
      console.log('AuthService: Firebase auth state changed:', user);
      this.currentUserSource.next(user);
      
      // If this is the first auth state change, mark initial check as complete
      if (!this.authStatusChecked.value) {
        this.authStatusChecked.next(true);
      }
    });
  }

  // Wait for the initial auth state to be determined
  waitForInitialAuth(): Observable<User | null> {
    return this.authStatusChecked$.pipe(
      filter(checked => checked),
      take(1),
      switchMap(() => this.currentUser$.pipe(
        take(1)
      ))
    );
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
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return null;
  }

  ngOnDestroy() {
    if (this.unsubscribeAuthState) {
      this.unsubscribeAuthState();
    }
  }
}
