import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ThemeService } from '../../services/theme.service';
import { ClarityModule } from '@clr/angular';
import { MonacoConfig } from '../../monaco-config';

@Component({
  selector: 'app-editor-panel',
  imports: [FormsModule, RouterModule, MonacoEditorModule, ClarityModule, CommonModule],
  templateUrl: './editor-panel.component.html',
  styleUrls: ['./editor-panel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorPanelComponent implements OnInit {
  @Input() language: string | undefined;
  @Input() controls: boolean = false;
  editorOptions = MonacoConfig.getEditorOptions();
  code = ``;

  copyToClipboard() {
    navigator.clipboard.writeText(this.code).then(() => {
      const copyButton = document.querySelector('.tool-button .btn');
      if (copyButton) {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }
    }).catch(err => {
      // Do nothing on error
    });
  }

  toggleWordWrap() {
    this.editorOptions.wordWrap = this.editorOptions.wordWrap === 'on' ? 'off' : 'on';
    this.editorOptions = { ...this.editorOptions };
  }

  clearCode() {
    this.code = '';
  }

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.editorOptions = MonacoConfig.getEditorOptions(this.language || 'text');
    this.themeService.theme$.subscribe(theme => {
      const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      this.editorOptions = MonacoConfig.getEditorOptions(this.language || 'text', editorTheme);
    });
  }
}
