import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sha256-hash',
  imports: [FormsModule, RouterModule],
  templateUrl: './sha256-hash.component.html',
  styleUrl: './sha256-hash.component.css'
})
export class Sha256HashComponent {
  value: string = '';
}
