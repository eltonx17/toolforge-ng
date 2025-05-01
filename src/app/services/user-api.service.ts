import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  async sendSignupProfile(user: any): Promise<Response> {
    // Send all relevant Firebase user profile data
    const payload = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: user.providerId
    };
    return fetch(`${environment.apiBaseUrl}/users/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async getUserDetails(email: string): Promise<any> {
    const response = await fetch(`${environment.apiBaseUrl}/users/user-details/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  }
}
