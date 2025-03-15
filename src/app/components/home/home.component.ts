import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, 
  homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon } from '@cds/core/icon';

ClarityIcons.addIcons(toolsIcon, cogIcon, moonIcon, sunIcon, chatBubbleIcon, 
  homeIcon, hashtagIcon, formIcon, languageIcon, boltIcon, nvmeIcon, dataClusterIcon, wrenchIcon);

@Component({
  selector: 'app-home',
  imports: [RouterModule, ClarityModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
    constructor(public router: Router) {}

    isHovered: boolean[] = [false, false, false, false, false, false, false, false];

    showOverlay(index: number) {
      this.isHovered[index] = true;
    }

    hideOverlay(index: number) {
      this.isHovered[index] = false;
    }
}
