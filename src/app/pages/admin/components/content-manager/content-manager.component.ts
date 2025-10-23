import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { take } from 'rxjs/operators';
import { ConteudoService, ConteudoSite } from '../../../../core/services/conteudo.service';
import { FirebaseStorageService } from '../../../../core/services/firebase-storage.service';
import { ImageOptimizerService } from '../../../../core/services/image-optimizer.service';

@Component({
  selector: 'app-content-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AccordionModule,
    ProgressSpinnerModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './content-manager.component.html',
  styleUrl: './content-manager.component.scss'
})
export class ContentManagerComponent implements OnInit {
  conteudo: ConteudoSite = {};
  isLoading = false;
  activePanel = 'heroSlides';

  constructor(
    private conteudoService: ConteudoService,
    private firebaseStorage: FirebaseStorageService,
    private imageOptimizer: ImageOptimizerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarConteudo();
    this.testarFirebaseConnection();
  }

  async testarFirebaseConnection(): Promise<void> {
    try {
      const isConnected = await this.firebaseStorage.testConnection();
      if(!isConnected) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Firebase',
          detail: 'Problema de conexão com Firebase Storage. Verifique as regras de segurança.'
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Firebase',
        detail: 'Erro ao conectar com Firebase Storage. Verifique sua configuração.'
      });
    }
  }

  carregarConteudo(): void {
    this.isLoading = true;
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.conteudo = conteudo;
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar conteúdo do site.'
        });
        this.isLoading = false;
      }
    });
  }

  // Métodos para upload de imagens
  uploadImage(type: string, index: number): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImageUpload(file, type, index);
      }
    };
    
    input.click();
  }

  private async handleImageUpload(file: File, type: string, index: number): Promise<void> {
    try {
      // Mostrar mensagem de otimização
      this.messageService.add({
        severity: 'info',
        summary: 'Otimização',
        detail: 'Otimizando imagem antes do upload...'
      });
      
      // Gerar nome único para o arquivo
      const fileName = this.firebaseStorage.generateUniqueFileName(file.name, type);
      
      // Upload otimizado para Firebase Storage
      const { url: imageUrl, optimization } = await this.firebaseStorage.uploadOptimizedImage(file, fileName, type);
      
      // Mostrar feedback de otimização
      const originalSize = this.imageOptimizer.formatFileSize(optimization.originalSize);
      const optimizedSize = this.imageOptimizer.formatFileSize(optimization.optimizedSize);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Otimização Concluída',
        detail: `Imagem otimizada: ${originalSize} → ${optimizedSize} (${optimization.reductionPercentage}% menor)`
      });
      
      // Atualizar o conteúdo local
      this.updateImageInContent(type, index, imageUrl);
      
      // Salvar no backend
      await this.saveContent();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Imagem enviada com sucesso!'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao fazer upload da imagem'
      });
    }
  }

  private updateImageInContent(type: string, index: number, imageUrl: string): void {
    switch (type) {
      case 'hero':
        if (this.conteudo.heroSlides?.[index]) {
          this.conteudo.heroSlides[index].image = imageUrl;
        }
        break;
      case 'gallery':
        if (this.conteudo.galleryImages?.[index]) {
          this.conteudo.galleryImages[index].thumbnail = imageUrl;
          this.conteudo.galleryImages[index].full = imageUrl;
        }
        break;
      case 'chalet':
        if (this.conteudo.chaletImages?.[index]) {
          this.conteudo.chaletImages[index].src = imageUrl;
        }
        break;
      case 'about':
        if (!this.conteudo.aboutImage) {
          this.conteudo.aboutImage = { url: '', alt: '' };
        }
        this.conteudo.aboutImage.url = imageUrl;
        break;
      case 'baptism':
        if (!this.conteudo.baptismImage) {
          this.conteudo.baptismImage = { url: '', alt: '' };
        }
        this.conteudo.baptismImage.url = imageUrl;
        break;
    }
  }

  private async saveContent(): Promise<void> {
    try {
      await this.conteudoService.updateConteudoSite(this.conteudo).pipe(
        take(1)
      ).toPromise();
    } catch (error) {
      throw error;
    }
  }

  // Métodos para Hero Slides
  addHeroSlide(): void {
    if (!this.conteudo.heroSlides) {
      this.conteudo.heroSlides = [];
    }
    this.conteudo.heroSlides.push({
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      title: 'Novo Slide',
      subtitle: 'Subtítulo do slide',
      cta: 'Reservar Agora',
      alt: 'Imagem do slide'
    });
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Slide adicionado!'
    });
  }

  saveHeroSlide(index: number): void {
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Slide salvo!'
    });
  }

  deleteHeroSlide(index: number): void {
    if (this.conteudo.heroSlides && this.conteudo.heroSlides.length > index) {
      this.conteudo.heroSlides.splice(index, 1);
      this.saveContent();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Slide removido!'
      });
    }
  }

  // Métodos para Galeria
  addGalleryImage(): void {
    if (!this.conteudo.galleryImages) {
      this.conteudo.galleryImages = [];
    }
    this.conteudo.galleryImages.push({
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=450&fit=crop',
      full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
      alt: 'Imagem da galeria',
      title: 'Nova Imagem'
    });
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Imagem adicionada!'
    });
  }

  saveGalleryImage(index: number): void {
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Imagem salva!'
    });
  }

  deleteGalleryImage(index: number): void {
    if (this.conteudo.galleryImages && this.conteudo.galleryImages.length > index) {
      this.conteudo.galleryImages.splice(index, 1);
      this.saveContent();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Imagem removida!'
      });
    }
  }

  // Métodos para Chalés
  addChaletImage(): void {
    if (!this.conteudo.chaletImages) {
      this.conteudo.chaletImages = [];
    }
    this.conteudo.chaletImages.push({
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      alt: 'Imagem do chalé',
      title: 'Novo Chalé',
      description: 'Descrição do chalé'
    });
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Chalé adicionado!'
    });
  }

  saveChaletImage(index: number): void {
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Chalé salvo!'
    });
  }

  deleteChaletImage(index: number): void {
    if (this.conteudo.chaletImages && this.conteudo.chaletImages.length > index) {
      this.conteudo.chaletImages.splice(index, 1);
      this.saveContent();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Chalé removido!'
      });
    }
  }

  // Métodos para About
  saveAboutImage(): void {
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Imagem da seção About salva!'
    });
  }

  // Métodos para Batismo
  saveBaptismImage(): void {
    this.saveContent();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Imagem da seção Batismo salva!'
    });
  }

  updateAboutAlt(value: string): void {
    if (this.conteudo.aboutImage) {
      this.conteudo.aboutImage.alt = value;
    }
  }

  updateBaptismAlt(value: string): void {
    if (this.conteudo.baptismImage) {
      this.conteudo.baptismImage.alt = value;
    }
  }
}
