import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lazy-image-container" [style.width]="width" [style.height]="height">
      <img 
        #imageRef
        [src]="placeholderSrc" 
        [alt]="alt"
        [class]="imageClass"
        [style.width]="width"
        [style.height]="height"
        loading="lazy"
        (load)="onImageLoad()"
        (error)="onImageError()"
      />
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .lazy-image-container {
      position: relative;
      overflow: hidden;
      background-color: #f5f5f5;
    }
    
    img {
      transition: opacity 0.3s ease;
      object-fit: cover;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LazyImageComponent implements OnInit, AfterViewInit {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width: string = '100%';
  @Input() height: string = 'auto';
  @Input() imageClass: string = '';
  @Input() placeholderSrc: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+';
  
  @ViewChild('imageRef') imageRef!: ElementRef<HTMLImageElement>;
  
  isLoading = true;
  private observer?: IntersectionObserver;

  ngOnInit() {
    // Se não há src, não precisa carregar
    if (!this.src) {
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    if (this.src && 'IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else if (this.src) {
      // Fallback para navegadores sem IntersectionObserver
      this.loadImage();
    }
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });

    this.observer.observe(this.imageRef.nativeElement);
  }

  private loadImage() {
    const img = new Image();
    img.onload = () => {
      if (this.imageRef) {
        this.imageRef.nativeElement.src = this.src;
        this.isLoading = false;
      }
    };
    img.onerror = () => {
      this.onImageError();
    };
    img.src = this.src;
  }

  onImageLoad() {
    this.isLoading = false;
  }

  onImageError() {
    this.isLoading = false;
    // Opcional: definir uma imagem de erro padrão
    if (this.imageRef) {
      this.imageRef.nativeElement.src = this.placeholderSrc;
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
