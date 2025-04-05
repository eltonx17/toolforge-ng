import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // For API base URL

@Injectable({
  providedIn: 'root',
})
export class ChatStreamService {
  constructor(private zone: NgZone) {}

  /**
   * Connects to the backend SSE endpoint and returns an Observable
   * emitting the stream's data chunks.
   *
   * @param prompt The user prompt to send to the backend.
   * @returns An Observable<string> that emits message data.
   */
  streamChat(prompt: string): Observable<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${environment.apiBaseUrl}/stream/chat?message=${encodedPrompt}`;

    return new Observable<string>((observer) => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          console.log('Received message:', "Test -"+JSON.stringify(event.data)+"-");
          observer.next(event.data);
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            console.log('SSE connection closed by server.');
            observer.complete(); 
          } else {
            console.error('SSE error:', error);
            observer.error(error);
          }
          eventSource.close();
        });
      };

      eventSource.onopen = () => {
        this.zone.run(() => {
          console.log('SSE connection opened.');
        });
      };

      return () => {
        console.log('Closing SSE connection.');
        eventSource.close();
      };
    });
  }

  streamChatWithModel(prompt: string, model: string): Observable<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedModel = encodeURIComponent(model);
    const url = `${environment.apiBaseUrl}/stream/chat-model?message=${encodedPrompt}&model=${encodedModel}`;

    return new Observable<string>((observer) => {
       const eventSource = new EventSource(url);
       eventSource.onmessage = (event) => { this.zone.run(() => observer.next(event.data)); };
       eventSource.onerror = (error) => {
         this.zone.run(() => {
           if (eventSource.readyState === EventSource.CLOSED) observer.complete();
           else observer.error(error);
           eventSource.close();
         });
       };
       eventSource.onopen = () => { this.zone.run(() => console.log('SSE connection opened with model:', model)); };
       return () => { eventSource.close(); };
    });
  }
}