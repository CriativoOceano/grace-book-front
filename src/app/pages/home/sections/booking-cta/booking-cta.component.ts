import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';

@Component({
  selector: 'app-booking-cta',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './booking-cta.component.html',
  styleUrl: './booking-cta.component.scss'
})
export class BookingCtaComponent {
  @Output() goToBooking = new EventEmitter<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  onBookingClick(): void {
    this.goToBooking.emit();
  }

  scrollToGallery(): void {
    if (isPlatformBrowser(this.platformId)) {
      const galleryElement = document.querySelector('app-gallery');
      if (galleryElement) {
        galleryElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }
}
