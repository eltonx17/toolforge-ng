import { Component, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarkdownComponent, SECURITY_CONTEXT } from 'ngx-markdown';
import { ListClassDirective } from '../../../directives/list-class.directive'; 
import { ChatStreamService } from '../../../services/chat-stream.service';
import { Subscription } from 'rxjs';

interface UserMessage {
  content: string;
  type: 'user';
  isStreaming?: boolean; 
  error?: boolean;
}

interface AiMessage {
  content: string;
  type: 'ai';
  isStreaming?: boolean; 
  error?: boolean;    
}

type Message = UserMessage | AiMessage;

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    RouterModule,
    ClarityModule,
    FormsModule,
    CommonModule,
    MarkdownComponent,
    ListClassDirective
  ],
  providers: [
    { provide: SECURITY_CONTEXT, useValue: SecurityContext.HTML },
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  public messages: Message[] = [];
  public newMessage: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  private streamingSubscription: Subscription | null = null;
  private needsScroll: boolean = false;

  constructor(
    private chatStreamService: ChatStreamService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll) {
      this.scrollToBottom();
      this.needsScroll = false; 
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const userMessageContent = this.newMessage;
    if (!userMessageContent || this.isLoading) {
      return;
    }
  
    // 1. Add user message at the top
    this.messages.unshift({ content: userMessageContent, type: 'user' });
    const prompt = userMessageContent; // Store prompt before clearing
    this.newMessage = ''; // Clear input field
  
    // 2. Prepare for AI response
    this.isLoading = true;
    this.error = null;
    this.unsubscribe(); // Ensure any previous stream is stopped
  
    // 3. Add an AI placeholder at the top and track its ID
    const aiMessageId = Date.now().toString(); // Unique identifier
    const aiMessage: AiMessage & { id: string } = { content: '', type: 'ai', isStreaming: true, id: aiMessageId };
    this.messages.unshift(aiMessage);
  
    // 4. Call the streaming service
    this.streamingSubscription = this.chatStreamService.streamChat(prompt).subscribe({
      next: (chunk) => {
        // Find the AI message by its unique ID
        const aiMsg = this.messages.find(m => 'id' in m && m.id === aiMessageId) as AiMessage | undefined;
        if (aiMsg && aiMsg.isStreaming) {
          aiMsg.content += chunk;
        }
      },
      error: (err) => {
        console.error('Stream failed:', err);
        this.error = 'Failed to get response. Please try again.';
  
        const aiMsg = this.messages.find(m => 'id' in m && m.id === aiMessageId) as AiMessage | undefined;
        if (aiMsg && aiMsg.isStreaming) {
          aiMsg.error = true;
          aiMsg.content += `\n\n**Error:** ${this.error}`;
          aiMsg.isStreaming = false;
        }
        this.isLoading = false;
      },
      complete: () => {
        console.log('Stream completed.');
        const aiMsg = this.messages.find(m => 'id' in m && m.id === aiMessageId) as AiMessage | undefined;
        if (aiMsg && aiMsg.isStreaming) {
          aiMsg.isStreaming = false;
        }
        this.isLoading = false;
      },
    });
  }

  private addMessage(content: string, type: 'user' | 'ai', isStreaming: boolean = false): void {
    if (type === 'user') {
       this.messages.unshift({ content, type });
    } else {
       this.messages.unshift({ content, type, isStreaming, error: false });
    }
     this.needsScroll = true;
  }

  private unsubscribe(): void {
    if (this.streamingSubscription) {
      this.streamingSubscription.unsubscribe();
      this.streamingSubscription = null;
      console.log('Unsubscribed from stream.');
       // Find potentially unfinished streaming message and mark it as not streaming
       const streamingMsg = this.messages.find(m => m.type === 'ai' && m.isStreaming);
       if (streamingMsg) {
         streamingMsg.isStreaming = false;
       }
    }
  }

  stopStreaming(): void {
    this.unsubscribe(); // This now handles marking the last message correctly
    this.isLoading = false;
    console.log('Streaming stopped by user.');
  }

  // --- Scrolling Logic ---
  private scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

}