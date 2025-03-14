import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { ClrTextareaModule } from '@clr/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [RouterModule, ClarityModule, ClrTextareaModule, FormsModule, CommonModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent {
  messages: string[] = [];
  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.unshift(this.newMessage.replace(/\n/g, '\n'));
      this.newMessage = '';
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
