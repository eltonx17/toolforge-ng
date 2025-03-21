import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import { ClarityModule, ClrAlertModule } from '@clr/angular';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-formatter',
  imports: [RouterModule, EditorPanelComponent, ClarityModule, ClrAlertModule, CommonModule],
  templateUrl: './formatter.component.html',
  styleUrl: './formatter.component.css'
})
export class FormatterComponent {
  selectedJsonMethod: string = 'JSON Validator';
  @ViewChild(EditorPanelComponent) editorPanel!: EditorPanelComponent;

  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success';

  onHashMethodSelect(event: Event) {
    const method = (event.target as HTMLElement).textContent?.trim();
    if (method) {
      this.selectedJsonMethod = method;
    }
  }

  validateAndFormatJson() {
    try {
      const parsedJson = JSON.parse(this.editorPanel.code);
      this.editorPanel.code = JSON.stringify(parsedJson, null, 2);
      this.alertMessage = 'Valid JSON';
      this.alertType = 'success';
    } catch (e) {
      this.alertMessage = 'Invalid JSON';
      this.alertType = 'danger';
    }
    this.showAlert = true;
    console.log('showAlert set to true');
    setTimeout(() => {
      this.showAlert = false;
      console.log('showAlert set to false');
    }, 2000);
  }
}
