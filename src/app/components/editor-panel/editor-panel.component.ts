import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-editor-panel',
  imports: [FormsModule, RouterModule, MonacoEditorModule],
  templateUrl: './editor-panel.component.html',
  styleUrls: ['./editor-panel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorPanelComponent implements OnInit {
  editorOptions = {
    language: 'text',
    theme: 'vs-light',
    minimap: { enabled: false },
  };
  code = ``;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      this.editorOptions = { ...this.editorOptions, theme: editorTheme };
    });
  }
}
