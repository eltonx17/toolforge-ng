import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditorPanelComponent } from '../../editor-panel/editor-panel.component';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'app-json-formatter',
  imports: [RouterModule, EditorPanelComponent, ClarityModule],
  templateUrl: './json-formatter.component.html',
  styleUrl: './json-formatter.component.css'
})
export class JsonFormatterComponent {
  selectedJsonMethod: string = 'JSON Validator';

  onHashMethodSelect(event: Event) {
    const method = (event.target as HTMLElement).textContent?.trim();
    if (method) {
      this.selectedJsonMethod = method;
    }
  }
}
