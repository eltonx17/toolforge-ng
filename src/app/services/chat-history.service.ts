
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatHistoryService {
  /**
   * Fetches chat history from the backend API.
   * @returns Observable<any> with the chat history data
   */
  getChatHistory(): Observable<any> {
    const url = `${environment.apiBaseUrl}/stream/history`;
    return new Observable(observer => {
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          return response.json();
        })
        .then(data => {
          observer.next(data);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        });
    });
  }
}
