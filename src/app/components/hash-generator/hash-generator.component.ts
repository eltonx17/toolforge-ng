import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ThemeService } from '../../services/theme.service';
import { ClarityModule } from '@clr/angular';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';

@Component({
  selector: 'app-hash-generator',
  imports: [FormsModule, RouterModule, MonacoEditorModule, EditorPanelComponent, ClarityModule],
  templateUrl: './hash-generator.component.html',
  styleUrls: ['./hash-generator.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HashGeneratorComponent implements OnInit {
  value: string = '';
  editorOptions = {
    language: 'text',
    theme: 'vs-light',
    minimap: { enabled: false },
  };
  code = `
  {
      "$schema": "http://json-schema.org/draft-07/schema",
      "title": "ng-packagr Target",
      "description": "ng-packagr target options for Build Architect. Use to build library projects.",
      "type": "object",  
      ...
  }`;

  selectedHashMethod: string = 'SHA-256';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      this.editorOptions = { ...this.editorOptions, theme: editorTheme };
    });
  }

  onHashMethodSelect(event: Event) {
    const method = (event.target as HTMLElement).textContent?.trim();
    if (method) {
      this.selectedHashMethod = method;
    }
  }
}
