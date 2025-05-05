import { Injectable, NgZone } from '@angular/core';
import { Observable, Observer } from 'rxjs';
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
    const url = `${environment.apiBaseUrl}/stream/chat`;

    return new Observable<string>((observer: Observer<string>) => {
      const controller = new AbortController();
      const { signal } = controller;
      const decoder = new TextDecoder('utf-8');
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let buffer = '';
      let eventData = '';

      // Processes the buffer, extracting SSE events and notifying the observer
      const processBuffer = (): void => {
        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const line = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 1);

          if (line.startsWith('data:')) {
            let dataChunk = line.substring(5);
            if (dataChunk.startsWith(' ')) dataChunk = dataChunk.substring(1);
            eventData += dataChunk + '\n'; // Accumulate multi-line data with newline separator
          } else if (line === '') { // Empty line: end of event
            if (eventData !== '') {
              const finalData = eventData.endsWith('\n') ? eventData.slice(0, -1) : eventData; // Remove trailing newline for final data
              this.zone.run(() => observer.next(finalData));
            }
            eventData = ''; // Reset for next event
          }
          // Ignore other SSE fields (event, id, retry) and comments (:) for this use case
          else if (line !== '' && !line.startsWith(':') && !line.startsWith('event:') && !line.startsWith('id:') && !line.startsWith('retry:')) {
             console.warn('Received unexpected SSE line:', line);
          }

          boundary = buffer.indexOf('\n');
        }
      };

      // Reads chunks from the stream, decodes, and triggers buffer processing
      const readStream = (): void => {
        reader!.read().then(({ done, value }) => {
          if (signal.aborted) return; // Stop if aborted by cleanup

          if (done) {
            buffer += decoder.decode(); // Process any remaining bytes
            processBuffer();
            if (eventData !== '') { // Dispatch any final accumulated data if stream ended mid-event
              const finalData = eventData.endsWith('\n') ? eventData.slice(0, -1) : eventData;
              this.zone.run(() => observer.next(finalData));
            }
            this.zone.run(() => observer.complete());
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          processBuffer();
          readStream(); // Continue reading

        }).catch(error => {
          if (!signal.aborted) { // Only report error if not intentionally aborted
            console.error('Error reading stream:', error);
            this.zone.run(() => observer.error(error));
          }
        });
      };

      // Helper to get Session-Id from cookie
      function getSessionIdFromCookie(): string | null {
        const match = document.cookie.match(/(?:^|; )Session-Id=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'text/plain',
        'Accept': 'text/event-stream',
      };
      const sessionId = getSessionIdFromCookie();
      if (sessionId) {
        headers['Session-Id'] = sessionId;
      }

      // Main Fetch Execution
      fetch(url, {
        method: 'POST',
        headers,
        body: prompt,
        signal: signal, // Link fetch to the AbortController
      })
      .then(response => {
        const sessionId = response.headers.get('Session-Id');
        console.log('Session-Id from response:', sessionId);
        console.log('Session-Id from response:', response.headers);
        if (sessionId && !document.cookie.split('; ').find(row => row.startsWith('Session-Id='))) {
          document.cookie = `Session-Id=${sessionId}; path=/`;
        }

        if (!response.ok) {
          return response.text().then(errorText => {
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          });
        }
        if (!response.body) {
          throw new Error('Response body is null');
        }
        reader = response.body.getReader();
        readStream(); // Start reading the stream
        return; // Satisfy compiler for void return in success path
      })
      .catch(error => {
        if (!signal.aborted) { // Only report error if not intentionally aborted
          console.error('Fetch setup error:', error);
          this.zone.run(() => observer.error(error));
        }
      });

      // Cleanup Function (called on Observable unsubscribe)
      return () => {
        console.log('Unsubscribing from chat stream, aborting request.');
        controller.abort(); // Abort fetch/stream reading
        if (reader) {
          reader.cancel().catch(e => console.warn("Error cancelling reader:", e)); // Release reader lock
        }
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