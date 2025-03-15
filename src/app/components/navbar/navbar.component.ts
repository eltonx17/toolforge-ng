import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, 
  homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon } from '@cds/core/icon';

ClarityIcons.addIcons(toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ClarityModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isNavCollapsed = true;

  constructor(public router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isNavCollapsed = event.target.innerWidth >= 992;
  }

  ngOnInit() {
    this.isNavCollapsed = window.innerWidth >= 992;
  }

  toggleTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'dark' : 'light';
    document.body.setAttribute('cds-theme', theme);
  }
}
