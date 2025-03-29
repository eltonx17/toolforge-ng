import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon, userIcon, logoutIcon } from '@cds/core/icon';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

ClarityIcons.addIcons(toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon, userIcon, logoutIcon);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ClarityModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isNavCollapsed = true;
  currentUser: User | null = null;
  userFirstName: string | null = null;
  private authSubscription: Subscription | null = null;

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
    
    // Sync the checkbox with the current theme
    const themeToggle = document.querySelector('#theme-toggle') as HTMLInputElement;
    if (themeToggle) {
      themeToggle.checked = this.themeService.getTheme() === 'dark';
    }

    // Wait for initial auth state and then subscribe to changes
    this.authService.waitForInitialAuth().subscribe(initialUser => {
      this.currentUser = initialUser;
      this.userFirstName = this.authService.getUserFirstName();
      
      // Subscribe to subsequent changes
      this.authSubscription = this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.userFirstName = this.authService.getUserFirstName();
      });
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
