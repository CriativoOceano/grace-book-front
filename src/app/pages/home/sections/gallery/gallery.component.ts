import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';
import { ConteudoService, GalleryImage } from '../../../../core/services/conteudo.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  @Output() bookingClick = new EventEmitter<void>();

  images: GalleryImage[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private conteudoService: ConteudoService
  ) {}

  ngOnInit(): void {
    this.carregarImagens();
  }

  carregarImagens(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.images = conteudo.galleryImages || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.images = this.conteudoService.getGalleryImages();
        this.isLoading = false;
      }
    });
  }

  openLightbox(image: any): void {
    // Implementar lightbox futuramente
  }

  goToBooking(): void {
    this.bookingClick.emit();
    this.router.navigate(['/booking']);
  }
}
