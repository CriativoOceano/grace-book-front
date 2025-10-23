import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ConteudoService, HeroSlide } from '../../../../core/services/conteudo.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  @Output() goToBooking = new EventEmitter<void>();

  currentSlide = 0;
  private intervalId?: number;
  slides: HeroSlide[] = [];
  isLoading = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private conteudoService: ConteudoService
  ) {}

  ngOnInit() {
    this.carregarSlides();
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoPlay();
    }
  }

  carregarSlides(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.slides = conteudo.heroSlides || [];
        this.isLoading = false;
        
        // Reiniciar autoplay se já estiver rodando
        if (isPlatformBrowser(this.platformId) && this.slides.length > 0) {
          this.stopAutoPlay();
          this.startAutoPlay();
        }
      },
      error: (error) => {
        this.slides = this.conteudoService.getHeroSlides();
        this.isLoading = false;
      }
    });
  }

  startAutoPlay() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = window.setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  stopAutoPlay() {
    if (isPlatformBrowser(this.platformId) && this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  onBookingClick() {
    this.goToBooking.emit();
  }

  onMouseEnter() {
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoPlay();
    }
  }

  onMouseLeave() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }
}
