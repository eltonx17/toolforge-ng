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

  constructor(
    private authService: AuthService,
    private router: Router,
    private userApiService: UserApiService
  ) {}

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
        this.error = err.message;
        this.showSpinner = false;
      }
    });
  }

  loginWithGoogle() {
    this.showSpinner = true;
    this.error = null;
    
    // Create the Google provider and open the popup
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.authService.getAuth(), provider).then((result) => {
      this.handleAuthSuccess(result.user);
    }).catch((err) => {
      console.error('Google Sign In Error:', err);
      this.error = 'Failed to sign in with Google. Please try again.';
      this.showSpinner = false;
    });
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
