import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreventLoginPageGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('PreventLoginPageGuard: Checking if user is already logged in...');

    return this.authService.waitForInitialAuth().pipe(
      map(user => {
        console.log('PreventLoginPageGuard: Current user state:', user);
        if (user) { // If user IS logged in
          console.log('PreventLoginPageGuard: User is already authenticated. Redirecting away from login/register...');
          // Redirect to the main application page (e.g., dashboard or home)
          this.router.navigate(['/']); // Or '/dashboard', etc.
          return false; // *** Prevent activation of the login/register route ***
        }
        // If user is NOT logged in
        console.log('PreventLoginPageGuard: User is not authenticated. Allowing access to login/register...');
        return true; // *** Allow activation of the login/register route ***
      }),
      // Ensure we always return a boolean value
      map(result => result || true)
    );
  }
}