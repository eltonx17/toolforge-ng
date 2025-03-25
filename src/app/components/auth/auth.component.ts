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

  constructor(private authService: AuthService) {}

  // Authentication methods
  login() {
    // Implementation needed
  }

  signUp() {
    // Implementation needed
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
    this.authService.googleSignIn().subscribe((res) => {
      this.user = res.user;
      console.log('User Logged In:', this.user);
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.user = null;
      console.log('User Logged Out');
    });
  }
}
