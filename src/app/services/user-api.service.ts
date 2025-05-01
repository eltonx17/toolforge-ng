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
    return fetch(`${environment.apiBaseUrl}/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}
