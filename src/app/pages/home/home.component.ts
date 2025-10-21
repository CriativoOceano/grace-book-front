import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importar componentes das seções
import { HeroComponent } from './sections/hero/hero.component';
import { AboutComponent } from './sections/about/about.component';
import { BaptismComponent } from './sections/baptism/baptism.component';
import { StructureComponent } from './sections/structure/structure.component';
import { GalleryComponent } from './sections/gallery/gallery.component';
import { BookingCtaComponent } from './sections/booking-cta/booking-cta.component';
import { LocationComponent } from './sections/location/location.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { SectionDividerComponent } from '../../shared/components/section-divider/section-divider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    HeroComponent,
    AboutComponent,
    BaptismComponent,
    StructureComponent,
    GalleryComponent,
    LocationComponent,
    SectionDividerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToBooking(): void {
    this.router.navigate(['/booking']);
  }
}