import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ThemeService } from '../../services/theme.service';
import { ClarityModule } from '@clr/angular';
import { MonacoConfig } from '../../monaco-config';

@Component({
  selector: 'app-editor-panel',
  imports: [FormsModule, RouterModule, MonacoEditorModule, ClarityModule],
  templateUrl: './editor-panel.component.html',
  styleUrls: ['./editor-panel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorPanelComponent implements OnInit {
  @Input() language: string | undefined;
  editorOptions = MonacoConfig.getEditorOptions();
  code = `{
  "simple key": "simple value",
  "numbers": 1234567,
  "simple list": [
    "value1",
    22222,
    "value3"
  ],
  "owner": null,
  "simple obect": {
    "simple key": "simple value",
    "numbers": 1234567,
    "simple list": [
      "value1",
      22222,
      "value3"
    ],
    "simple obect": {
      "key1": "value1",
      "key2": 22222,
      "key3": "value3"
    }
  }
}`;

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
