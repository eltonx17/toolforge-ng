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
import { environment } from '../../../../environments/environment';

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
    // Clear session cookie on load
    document.cookie = 'Session-Id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // On component load, make a call to backend to get fresh Session-Id
    this.getSessionIdOnLoad();
    setTimeout(() => {
      this.authSubscription = this.authService.currentUser$.subscribe(user => {
        this.isAuthenticated = !!user;
        this.showAuthModal = !user;
        this.cdRef.detectChanges();
      });
    }, 100); // 1 second delay
  }

  /**
   * Make a backend call to get Session-Id and store in cookie if not present
   */
  private getSessionIdOnLoad(): void {
    if (!document.cookie.split('; ').find(row => row.startsWith('Session-Id='))) {
      fetch(`${environment.apiBaseUrl}/stream/session`, { method: 'GET' })
        .then(res => res.text())
        .then(sessionId => {
          console.log('Session-Id from response:', sessionId);
          if (sessionId) {
            document.cookie = `Session-Id=${sessionId}; path=/`;
          }
        })
        .catch(() => {/* ignore errors, not critical for UI */ });
    }
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

    this.messages.unshift({ content: userMessageContent, type: 'user' });
    const prompt = userMessageContent; // Store prompt before clearing
    this.newMessage = ''; // Clear input field

    this.isLoading = true;
    this.error = null;
    this.unsubscribe(); // Ensure any previous stream is stopped

    const aiMessageId = Date.now().toString(); // Unique identifier
    const aiMessage: AiMessage & { id: string } = { content: '', type: 'ai', isStreaming: true, id: aiMessageId };
    this.messages.unshift(aiMessage);

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

  onAuthModalClose() {
    if (!this.isAuthenticated) {
      window.location.href = '/';
    }
  }

}