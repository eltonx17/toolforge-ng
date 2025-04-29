import { Component, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarkdownComponent, SECURITY_CONTEXT } from 'ngx-markdown';
import { ListClassDirective } from '../../../directives/list-class.directive'; 
import { ChatStreamService } from '../../../services/chat-stream.service';
import { AuthService } from '../../../services/auth.service';
import { AuthComponent } from '../../auth/auth.component';
import { Subscription } from 'rxjs';

interface UserMessage {
  content: string;
  type: string;
  previousReplyContext?: string;
  isStreaming?: boolean; 
  error?: boolean;
}

interface AiMessage {
  content: string;
  type: string;
  previousReplyContext?: string;
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
    ListClassDirective,
    AuthComponent
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
  isAuthenticated = false;
  showAuthModal = false;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  private streamingSubscription: Subscription | null = null;
  private needsScroll: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private chatStreamService: ChatStreamService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.showAuthModal = !user;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
    if (!this.isAuthenticated) {
      this.showAuthModal = true;
      return;
    }

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

    // 4. Prepare the context to send to the streaming service
    
    const historyMessages = this.messages; // e.g., array [0] to [5]
    const currentUserPrompt = prompt; // e.g., 'is it good?'
    const numberOfPairsToKeep = 10; // Or however many you want, e.g., Infinity for all

    const contextMessages = this.generateLlmContext(
      historyMessages,
      currentUserPrompt
    );

    //let contextMessages = [...this.messages];
    let tokenCount = this.calculateTokenCount(contextMessages.map(msg => msg.content));

    // If token count exceeds 1 million, shrink the context
    while (tokenCount > 1000000) {
      contextMessages.pop(); // Remove the oldest message
      tokenCount = this.calculateTokenCount(contextMessages.map(msg => msg.content));
    }
    
    console.log(contextMessages);
    // Convert contextMessages to a string
    const contextString = JSON.stringify(contextMessages);
  
    // 5. Call the streaming service
    this.streamingSubscription = this.chatStreamService.streamChat(contextString).subscribe({
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

  private calculateTokenCount(contents: string[]): number {
    return contents.reduce((count, content) => count + content.length, 0);
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
    this.unsubscribe();
    this.isLoading = false;
    console.log('Streaming stopped by user.');
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

  generateLlmContext(messages: Message[], prompt: string, maxContextPairs = Infinity) {
    let systemContextPairs = [];
  
    for (let i = 1; i < messages.length - 1; i++) {
      const currentMsg = messages[i];
      const nextMsg = messages[i + 1];
  
      if (currentMsg.type === 'ai' && nextMsg.type === 'user') {
        systemContextPairs.unshift({
          previousReplyContext: currentMsg.content,
          content: nextMsg.content,
          type: 'system',
        });
      }
    }
  
    let finalSystemPairs = systemContextPairs;
    if (maxContextPairs > 0 && maxContextPairs !== Infinity) {
      finalSystemPairs = systemContextPairs.slice(-maxContextPairs);
    }
  
    const finalMessages = [...finalSystemPairs];
  
    finalMessages.push({
      content: prompt,
      type: 'user',
      previousReplyContext: ''
    });
  
    return finalMessages;
  }

  onAuthModalClose() {
    if (!this.isAuthenticated) {
      window.location.href = '/';
    }
  }

}