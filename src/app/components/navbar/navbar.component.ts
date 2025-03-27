import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon, userIcon } from '@cds/core/icon';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';

ClarityIcons.addIcons(toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon, userIcon);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ClarityModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isNavCollapsed = true;
  currentUser: User | null = null;
  userFirstName: string | null = null;

  constructor(
    public router: Router, 
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 992) {
      this.isNavCollapsed = true;
    } else {
      this.isNavCollapsed = false;
    }
  }

  isWindowWidthGreaterThan992(): boolean {
    return window.innerWidth >= 992;
  }

  ngOnInit() {
    this.isNavCollapsed = window.innerWidth >= 992;
    const themeToggle = document.querySelector('#theme-toggle') as HTMLInputElement;
    if (themeToggle) {
      themeToggle.checked = true;
      this.themeService.setTheme('dark');
    }

    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userFirstName = this.authService.getUserFirstName();
    });
  }

  toggleTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const theme = isChecked ? 'dark' : 'light';
    this.themeService.setTheme(theme);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
