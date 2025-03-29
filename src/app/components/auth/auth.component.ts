import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons } from '@cds/core/icon';
import { FormsModule } from '@angular/forms';

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
  fname: string = '';
  lname: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  otp: string = '';
  rememberMe: boolean = false;
  
  // State properties
  signupMode: boolean = false;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  otpResent: boolean = false;
  showSpinner: boolean = false;
  forgotModal: boolean = false;
  passChanged: boolean = false;
  userValid: boolean = false;
  isMatch: boolean = false;
  
  // Error and message properties
  error: string | null = null;
  registerMailExists: string = '';
  newPassMsg: string = '';
  resetError: string = '';
  otpResponse: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

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
        this.user = user;
        console.log('User Logged In:', this.user);
        this.showSpinner = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login Error:', err);
        this.error = 'Invalid email or password';
        this.showSpinner = false;
      }
    });
  }

  signUp() {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.showSpinner = true;
    this.error = null;

    this.authService.signUp(this.email, this.password, this.rememberMe).subscribe({
      next: (user) => {
        this.user = user;
        console.log('User Signed Up:', this.user);
        this.showSpinner = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Sign Up Error:', err);
        this.error = err.message;
        this.showSpinner = false;
      }
    });
  }

  verifyAccount() {
    // Implementation needed
  }

  // Password reset methods
  openModal() {
    this.forgotModal = true;
  }

  closeModal() {
    this.forgotModal = false;
    this.resetState();
  }

  sendOtp() {
    // Implementation needed
  }

  verifyOtp() {
    // Implementation needed
  }

  changePassword() {
    // Implementation needed
  }

  // Helper methods
  checkEmail(event: any) {
    // Implementation needed
  }

  comparePassword(event: any) {
    // Implementation needed
  }

  resendOtp() {
    // Implementation needed
  }

  resetState() {
    this.otpSent = false;
    this.otpVerified = false;
    this.passChanged = false;
    this.error = null;
    this.resetError = '';
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  loginWithGoogle() {
    this.showSpinner = true;
    this.error = null;
    this.authService.googleSignIn(this.rememberMe).subscribe({
      next: (user) => {
        this.user = user;
        console.log('User Logged In:', this.user);
        this.showSpinner = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Google Sign In Error:', err);
        this.error = 'Failed to sign in with Google. Please try again.';
        this.showSpinner = false;
      }
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
