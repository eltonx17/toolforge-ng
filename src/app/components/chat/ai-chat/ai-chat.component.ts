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
import { ClarityIcons, arrowIcon, pinIcon, unpinIcon, historyIcon } from '@cds/core/icon';

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
ClarityIcons.addIcons(arrowIcon, pinIcon, unpinIcon, historyIcon);

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
  opened = false;

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
    setTimeout(() => {
      this.authSubscription = this.authService.currentUser$.subscribe(user => {
        this.isAuthenticated = !!user;
        this.showAuthModal = !user;
        this.cdRef.detectChanges();
      });
    }, 100); // 1 second delay
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
    // Exclude the AI placeholder (isStreaming: true, content: '') from context
    const historyMessages = this.messages.filter(m => !(m.type === 'ai' && (m as any).isStreaming && m.content === ''));
    const currentUserPrompt = prompt; // e.g., 'is it good?'
    const numberOfPairsToKeep = 10; // Or however many you want, e.g., Infinity for all

    const contextMessages = this.generateLlmContext(
      historyMessages,
      currentUserPrompt
    );

    //let contextMessages = [...this.messages];
    let tokenCount = this.calculateTokenCount(
      contextMessages.map(msg => (msg.user !== undefined ? msg.user : (msg.assistant !== undefined ? msg.assistant : '')))
    );

    // If token count exceeds 1 million, shrink the context
    while (tokenCount > 1000000) {
      contextMessages.pop(); // Remove the oldest message
      tokenCount = this.calculateTokenCount(
        contextMessages.map(msg => (msg.user !== undefined ? msg.user : (msg.assistant !== undefined ? msg.assistant : '')))
      );
    }

    console.log(contextMessages);
    // Convert contextMessages to a plain text string in the required format
    const contextString = contextMessages
      .map(msg => {
        if (msg.user !== undefined) return `user: ${msg.user}`;
        if (msg.assistant !== undefined) return `assistant: ${msg.assistant}`;
        return '';
      })
      .join('\n');

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
    // Robustly pair user/assistant, skipping duplicates and always alternating
    const context: { user: string; assistant: string }[] = [];
    let lastUser: string | null = null;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.type === 'user') {
        // If there's an unpaired user, push it with empty assistant
        if (lastUser !== null) {
          context.push({ user: lastUser, assistant: '' });
        }
        lastUser = msg.content;
      } else if (msg.type === 'ai' && lastUser !== null) {
        context.push({ user: lastUser, assistant: msg.content });
        lastUser = null;
      }
    }
    // If there's a user left without an assistant, pair with empty string
    if (lastUser !== null) {
      context.push({ user: lastUser, assistant: '' });
    }
    // Limit to maxContextPairs if needed
    let finalContext = context;
    if (maxContextPairs > 0 && maxContextPairs !== Infinity) {
      finalContext = context.slice(-maxContextPairs);
    }
    // Reverse the context list so the latest is last
    finalContext = finalContext.reverse();
    // Flatten to the requested format: user: "..." assistant: "..." ...
    const result: any[] = [];
    for (const pair of finalContext) {
      result.push({ user: pair.user });
      result.push({ assistant: pair.assistant });
    }
    return result;
  }

  onAuthModalClose() {
    if (!this.isAuthenticated) {
      window.location.href = '/';
    }
  }

}