import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, ClarityModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ToolForge';
}
