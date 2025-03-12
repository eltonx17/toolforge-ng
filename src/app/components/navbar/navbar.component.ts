import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon } from '@cds/core/icon';

ClarityIcons.addIcons(toolsIcon, cogIcon);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, ClarityModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {}
