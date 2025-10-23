import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ConteudoService, ChaletImage } from '../../core/services/conteudo.service';

@Component({
  selector: 'app-chalet-gallery',
  standalone: true,
  imports: [CommonModule, DialogModule, CarouselModule, ButtonModule, ImageModule],
  template: `
    <div class="chalet-gallery-container">
      <!-- Botão para abrir a galeria -->
      <p-button 
        label="Ver Chalés Disponíveis" 
        icon="pi pi-images" 
        severity="secondary"
        size="large"
        (onClick)="showGallery()"
        class="gallery-button">
      </p-button>

      <!-- Modal da galeria -->
      <p-dialog 
        header="Nossos Chalés" 
        [(visible)]="displayGallery" 
        [modal]="true" 
        [closable]="true"
        [style]="{ width: '90vw', maxWidth: '1200px' }"
        [contentStyle]="{ padding: '0' }">
        
        <div class="gallery-content">
          <!-- Carrossel principal -->
          <p-carousel 
            [value]="chaletImages" 
            [numVisible]="1" 
            [numScroll]="1"
            [circular]="true"
            [autoplayInterval]="0"
            class="main-carousel">
            
            <ng-template let-chalet #item>
              <div class="chalet-card">
                <div class="chalet-image-container">
                  <p-image 
                    [src]="chalet.src" 
                    [alt]="chalet.alt"
                    [preview]="true"
                    width="100%"
                    height="400px"
                    class="chalet-main-image">
                  </p-image>
                </div>
                
                <div class="chalet-info">
                  <h3 class="chalet-title">{{ chalet.title }}</h3>
                  <p class="chalet-description">{{ chalet.description }}</p>
                  
                  <div class="chalet-features">
                    <div class="feature-item">
                      <i class="pi pi-users"></i>
                      <span>Até 4 pessoas</span>
                    </div>
                    <div class="feature-item">
                      <i class="pi pi-home"></i>
                      <span>Ar condicionado</span>
                    </div>
                    <div class="feature-item">
                      <i class="pi pi-wifi"></i>
                      <span>Wi-Fi gratuito</span>
                    </div>
                    <div class="feature-item">
                      <i class="pi pi-car"></i>
                      <span>Estacionamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-carousel>

          <!-- Miniaturas -->
          <div class="thumbnails-container">
            <div class="thumbnails-grid">
              <div 
                *ngFor="let chalet of chaletImages; let i = index"
                class="thumbnail-item"
                [class.active]="i === currentIndex"
                (click)="goToSlide(i)">
                <img [src]="chalet.src" [alt]="chalet.alt" class="thumbnail-image">
                <div class="thumbnail-overlay">
                  <span class="thumbnail-title">{{ chalet.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <p-button 
              label="Fechar" 
              icon="pi pi-times" 
              severity="secondary"
              (onClick)="hideGallery()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .chalet-gallery-container {
      margin: 1rem 0;
    }

    .gallery-button {
      width: 100%;
      background: linear-gradient(135deg, #695643 0%, #7a6b4a 100%);
      border: none;
      border-radius: 12px;
      padding: 1rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(105, 86, 67, 0.3);
    }

    .gallery-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(105, 86, 67, 0.4);
    }

    .gallery-content {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .main-carousel {
      margin-bottom: 1rem;
    }

    .chalet-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .chalet-image-container {
      position: relative;
      overflow: hidden;
    }

    .chalet-main-image {
      border-radius: 0;
    }

    .chalet-info {
      padding: 1.5rem;
    }

    .chalet-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #695643;
      margin-bottom: 0.5rem;
    }

    .chalet-description {
      color: #6b5b47;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .chalet-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #695643;
    }

    .feature-item i {
      color: #695643;
      font-size: 1rem;
    }

    .thumbnails-container {
      padding: 1rem;
      background: #f8f9fa;
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .thumbnail-item {
      position: relative;
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      aspect-ratio: 4/3;
    }

    .thumbnail-item:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(105, 86, 67, 0.3);
    }

    .thumbnail-item.active {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(105, 86, 67, 0.5);
      border: 2px solid #695643;
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: 0.5rem;
      color: white;
    }

    .thumbnail-title {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .chalet-features {
        grid-template-columns: repeat(2, 1fr);
      }

      .thumbnails-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .chalet-info {
        padding: 1rem;
      }

      .chalet-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ChaletGalleryComponent implements OnInit {
  @Input() displayGallery = false;
  currentIndex = 0;
  chaletImages: ChaletImage[] = [];
  isLoading = true;

  constructor(private conteudoService: ConteudoService) {}

  ngOnInit() {
    this.carregarChaletImages();
  }

  carregarChaletImages(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.chaletImages = conteudo.chaletImages || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.chaletImages = this.conteudoService.getChaletImages();
        this.isLoading = false;
      }
    });
  }

  showGallery() {
    this.displayGallery = true;
  }

  hideGallery() {
    this.displayGallery = false;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
