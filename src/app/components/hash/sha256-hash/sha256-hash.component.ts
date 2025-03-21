import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-sha256-hash',
  imports: [FormsModule, RouterModule, MonacoEditorModule],
  templateUrl: './sha256-hash.component.html',
  styleUrl: './sha256-hash.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Sha256HashComponent implements OnInit {
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

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      this.editorOptions = { ...this.editorOptions, theme: editorTheme };
    });
  }
}
