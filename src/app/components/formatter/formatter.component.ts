import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'app-formatter',
  imports: [RouterModule, EditorPanelComponent, ClarityModule],
  templateUrl: './formatter.component.html',
  styleUrl: './formatter.component.css'
})
export class FormatterComponent {
  selectedJsonMethod: string = 'JSON Validator';

  onHashMethodSelect(event: Event) {
    const method = (event.target as HTMLElement).textContent?.trim();
    if (method) {
      this.selectedJsonMethod = method;
    }
  }
}
