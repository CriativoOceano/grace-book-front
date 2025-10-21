import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {}
