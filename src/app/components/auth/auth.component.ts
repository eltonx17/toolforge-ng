import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons } from '@cds/core/icon';
import { FormsModule } from '@angular/forms';
import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, ClarityModule, FormsModule],
  providers: [AuthService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  // User properties
  user: any = null;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  rememberMe: boolean = true;

  // State properties
  signupMode: boolean = false;
  showSpinner: boolean = false;


  // Error property
  error: string | null = null;

  // Forgot password state
  forgotPasswordMode: boolean = false;
  resetEmail: string = '';
  resetMessage: string | null = null;

  // Toggle forgot password mode
  toggleForgotPasswordMode() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
    this.resetMessage = null;
    this.error = null;
    this.resetEmail = '';
  }

  // Send password reset email
  sendPasswordReset() {
    if (!this.resetEmail) {
      this.resetMessage = null;
      this.error = 'Please enter your email address.';
      return;
    }
    this.showSpinner = true;
    this.error = null;
    this.resetMessage = null;
    this.authService.sendPasswordReset(this.resetEmail).subscribe({
      next: () => {
        this.resetMessage = 'Password reset email sent. Please check your inbox.';
        this.showSpinner = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to send password reset email.';
        this.showSpinner = false;
      }
    });
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private userApiService: UserApiService
  ) { }

  // Password validation method
  validatePasswords() {
    if (!this.confirmPassword) {
      this.error = null;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
    } else {
      this.error = null;
    }
  }

  // Helper method to handle successful authentication
  private handleAuthSuccess(user: any) {
    this.user = user;
    this.showSpinner = false;
    if (this.router.url == '/login') {
      this.router.navigate(['/']);
    }
  }

  // Authentication methods
  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }

    this.showSpinner = true;
    this.error = null;

    this.authService.signIn(this.email, this.password, this.rememberMe).subscribe({
      next: (user) => {
        this.handleAuthSuccess(user);
      },
      error: (err) => {
        console.error('Login Error:', err);
        this.error = 'Invalid email or password';
        this.showSpinner = false;
      }
    });
  }

  async signUp() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please enter both email and password';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.showSpinner = true;
    this.error = null;

    this.authService.signUp(this.email, this.password, this.rememberMe).subscribe({
      next: async (user) => {
        try {
          await this.userApiService.sendSignupProfile(user);
        } catch (apiErr) {
          console.error('Failed to send user profile to backend:', apiErr);
        }
        this.handleAuthSuccess(user);
      },
      error: (err) => {
        console.error('Sign Up Error:', err);
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Email already in use. Please try another one.';
        } else if (err.code === 'auth/invalid-email') {
          this.error = 'Invalid email address. Please check and try again.';
        }
        else if (err.code === 'auth/weak-password') {
          this.error = 'Password is too weak. Please choose a stronger password.';
        }
        else if (err.code === 'auth/operation-not-allowed') {
          this.error = 'Operation not allowed. Please contact support.';
        } else {
          this.error = err.message;
        }
        this.showSpinner = false;
      }
    });
  }

  async loginWithGoogle() {
    this.showSpinner = true;
    this.error = null;

    // Create the Google provider and open the popup
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.authService.getAuth(), provider);
      try {
        await this.userApiService.sendSignupProfile(result.user);
      } catch (apiErr) {
        console.error('Failed to send user profile to backend:', apiErr);
      }
      this.handleAuthSuccess(result.user);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      this.error = 'Failed to sign in with Google. Please try again.';
      this.showSpinner = false;
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.user = null;
      console.log('User Logged Out');
      this.router.navigate(['/login']);
    });
  }

  toggleSignupMode() {
    this.signupMode = !this.signupMode;
    this.error = null;
  }
}
