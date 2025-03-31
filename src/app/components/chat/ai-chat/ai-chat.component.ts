import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { ClrTextareaModule } from '@clr/angular';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownComponent, SECURITY_CONTEXT } from 'ngx-markdown';
import { ListClassDirective } from '../../../directives/list-class.directive';
import { environment } from '../../../../environments/environment';
interface UserMessage {
  content: string;
  type: 'user';
}

interface AiMessage {
  content: string;
  type: 'ai';
}

type Message = UserMessage | AiMessage;

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    RouterModule,
    ClarityModule,
    ClrTextareaModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MarkdownComponent,
    ListClassDirective
  ],
  providers: [
    { provide: SECURITY_CONTEXT, useValue: SecurityContext.HTML }
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit, OnDestroy {
  // --- Configuration ---
  private readonly webSocketUrl = environment.webSocketUrl;

  // --- State ---
  private socket: WebSocket | null = null;
  public connectionStatus: 'Connecting' | 'Connected' | 'Disconnected' | 'Error' = 'Disconnected';
  public messages: Message[] = [];
  public newMessage: string = '';
  public errorMessage: string | null = null;
  public isProcessing: boolean = false;
  private currentAiResponse: string = '';

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  // --- WebSocket Connection Handling ---
  connectWebSocket(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      return;
    }

    this.connectionStatus = 'Connecting';
    this.errorMessage = null;
    console.log(`Attempting to connect to ${this.webSocketUrl}`);

    this.socket = new WebSocket(this.webSocketUrl);

    this.socket.onopen = (event) => {
      console.log('WebSocket connection opened:', event);
      this.connectionStatus = 'Connected';
      this.errorMessage = null;
      this.isProcessing = false;
      this.cdr.detectChanges();
    };

    this.socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      this.handleIncomingMessage(event.data);
      this.cdr.detectChanges();
    };

    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.connectionStatus = 'Error';
      this.errorMessage = 'WebSocket error occurred. Check console for details.';
      this.isProcessing = false;
      this.cdr.detectChanges();
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (this.connectionStatus !== 'Error') {
        this.connectionStatus = 'Disconnected';
      }
      this.socket = null;
      this.isProcessing = false;

      if (!event.wasClean) {
        this.errorMessage = `Connection lost (Code: ${event.code}). Attempting to reconnect...`;
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(() => this.connectWebSocket(), 5000);
      } else {
        this.errorMessage = `Connection closed (Code: ${event.code})`;
      }
      this.cdr.detectChanges();
    };
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      console.log('Closing WebSocket connection.');
      this.socket.close(1000, "Client disconnected");
      this.socket = null;
      this.connectionStatus = 'Disconnected';
      this.isProcessing = false;
    }
  }

  // --- Message Handling ---
  handleIncomingMessage(rawData: string): void {
    try {
      const message = JSON.parse(rawData);
      if (!message || !message.type || message.payload === undefined) {
        console.warn('Received malformed message:', rawData);
        this.errorMessage = `Received malformed message: ${rawData}`;
        return;
      }

      switch (message.type) {
        case 'token':
          this.currentAiResponse += message.payload;
          // Update the last AI message with new content
          const lastMessage = this.messages[0];
          if (lastMessage && lastMessage.type === 'ai') {
            lastMessage.content = this.currentAiResponse;
          }
          this.errorMessage = null;
          break;
        case 'status':
          console.log('Status update:', message.payload);
          break;
        case 'end':
          console.log('Stream finished:', message.payload);
          this.currentAiResponse = '';
          this.isProcessing = false;
          break;
        case 'error':
          console.error('Received error from server:', message.payload);
          this.errorMessage = `Server Error: ${message.payload}`;
          this.messages.unshift({ type: 'ai', content: `[ERROR: ${message.payload}]` });
          this.isProcessing = false;
          break;
        default:
          console.warn('Received unknown message type:', message.type);
          this.messages.unshift({ type: 'ai', content: `[UNKNOWN TYPE: ${message.type} | PAYLOAD: ${message.payload}]` });
      }
    } catch (e) {
      console.error('Failed to parse incoming message:', rawData, e);
      this.errorMessage = `Failed to parse message: ${rawData}`;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) {
      return;
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.errorMessage = 'WebSocket is not connected. Please wait or try reconnecting.';
      console.error('Attempted to send message while WebSocket is not open.');
      return;
    }

    const message = JSON.stringify({ prompt: this.newMessage });
    console.log('Sending message:', message);
    this.socket.send(message);

    // Add user message to chat
    this.messages.unshift({ type: 'user', content: this.newMessage });
    // Add empty AI message that will be updated with tokens
    this.messages.unshift({ type: 'ai', content: '' });
    this.currentAiResponse = '';

    this.errorMessage = null;
    this.isProcessing = true;
    this.newMessage = '';
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Helper function for template binding
  isConnected(): boolean {
    return this.connectionStatus === 'Connected';
  }
}
