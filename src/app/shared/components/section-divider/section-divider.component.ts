import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-divider.component.html',
  styleUrl: './section-divider.component.scss'
})
export class SectionDividerComponent {
  @Input() type: 'wave' | 'decorative-line' | 'curve' = 'wave';
  @Input() color: 'primary' | 'secondary' | 'accent' = 'primary';
}
