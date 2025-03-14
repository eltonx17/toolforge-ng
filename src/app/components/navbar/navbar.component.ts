import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon, moonIcon, sunIcon } from '@cds/core/icon';

ClarityIcons.addIcons(toolsIcon, cogIcon, moonIcon, sunIcon);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ClarityModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(public router: Router) {}

  toggleTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'dark' : 'light';
    document.body.setAttribute('cds-theme', theme);
  }
}
