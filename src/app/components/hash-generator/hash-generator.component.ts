import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ClarityModule } from '@clr/angular';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-hash-generator',
  imports: [FormsModule, EditorPanelComponent, RouterModule, MonacoEditorModule, ClarityModule, CommonModule],
  templateUrl: './hash-generator.component.html',
  styleUrls: ['./hash-generator.component.css']
})
export class HashGeneratorComponent {
  @ViewChild(EditorPanelComponent) editorPanel!: EditorPanelComponent;

  selectedMethod: string = 'Hash';

  onMethodSelect(event: Event) {
    const method = (event.target as HTMLElement).textContent?.trim();
    if (method) {
      this.selectedMethod = method;
    }
  }


  md5Hash: string = "";
  sha1Hash: string = "";
  sha224Hash: string = "";
  sha256Hash: string = "";
  sha384Hash: string = "";
  sha512Hash: string = "";
  sha3Hash: string = "";
  generateHashes() {
    const message = this.editorPanel.code
    this.md5Hash = CryptoJS.MD5(message).toString();
    this.sha1Hash = CryptoJS.SHA1(message).toString();
    this.sha224Hash = CryptoJS.SHA224(message).toString();
    this.sha256Hash = CryptoJS.SHA256(message).toString();
    this.sha384Hash = CryptoJS.SHA384(message).toString();
    this.sha512Hash = CryptoJS.SHA512(message).toString();
    this.sha3Hash = CryptoJS.SHA3(message, { outputLength: 512 }).toString();
  }

  copyToClipboard(text: string, event: Event) {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        const button = event.target as HTMLButtonElement;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = button.getAttribute('data-original-text') || 'Copy';
        }, 2000);
    }).catch(() => {
        // Handle copy error if needed
    });
}
}
