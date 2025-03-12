import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sha256-hash',
  imports: [FormsModule],
  templateUrl: './sha256-hash.component.html',
  styleUrl: './sha256-hash.component.css'
})
export class Sha256HashComponent {
  value: string = '';
}
