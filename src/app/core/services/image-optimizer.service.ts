import { Injectable } from '@angular/core';
import Pica from 'pica';

export interface ImageOptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  maxSizeKB: number;
  quality: number;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
  format: string;
  dimensions: { width: number; height: number };
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizerService {
  private pica: any;
  private readonly MAX_SIZE_KB = 200;
  private readonly DEFAULT_QUALITY = 0.85;

  // Dimensões recomendadas por tipo de imagem
  private readonly IMAGE_DIMENSIONS: { [key: string]: { width: number; height: number } } = {
    hero: { width: 1920, height: 1080 },
    gallery: { width: 1200, height: 800 },
    galleryThumbnail: { width: 600, height: 450 },
    chalet: { width: 800, height: 600 },
    about: { width: 800, height: 600 },
    baptism: { width: 800, height: 600 }
  };

  constructor() {
    this.pica = new Pica({
      features: ['js', 'wasm', 'ww', 'cib'],
      tile: 1024
    });
  }

  /**
   * Otimiza uma imagem para upload
   * @param file Arquivo de imagem original
   * @param type Tipo da imagem (hero, gallery, chalet, etc.)
   * @returns Promise com arquivo otimizado e informações de otimização
   */
  async optimizeImage(file: File, type: string): Promise<{ file: File; result: OptimizationResult }> {
    try {
      // Validar arquivo
      if (!this.isValidImageFile(file)) {
        throw new Error('Arquivo não é uma imagem válida');
      }

      const originalSize = file.size;
      const dimensions = this.IMAGE_DIMENSIONS[type] || this.IMAGE_DIMENSIONS['about'];
      
      // Detectar melhor formato suportado
      const bestFormat = await this.getBestFormat();
      
      // Carregar imagem
      const image = await this.loadImage(file);
      
      // Calcular dimensões mantendo proporção
      const { width, height } = this.calculateDimensions(
        image.width, 
        image.height, 
        dimensions.width, 
        dimensions.height
      );

      // Redimensionar imagem
      const resizedBlob = await this.resizeImage(image, width, height);
      
      // Comprimir até atingir tamanho alvo
      const compressedBlob = await this.compressImage(resizedBlob, this.MAX_SIZE_KB * 1024, bestFormat);
      
      // Criar novo arquivo
      const optimizedFile = new File([compressedBlob], this.generateOptimizedFileName(file.name, bestFormat), {
        type: compressedBlob.type,
        lastModified: Date.now()
      });

      const result: OptimizationResult = {
        originalSize,
        optimizedSize: optimizedFile.size,
        reductionPercentage: Math.round(((originalSize - optimizedFile.size) / originalSize) * 100),
        format: bestFormat,
        dimensions: { width, height }
      };

      return { file: optimizedFile, result };
    } catch (error) {
      throw new Error(`Falha na otimização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Detecta o melhor formato de imagem suportado pelo navegador
   * @returns Promise com o formato ideal (avif, webp ou jpeg)
   */
  private async getBestFormat(): Promise<string> {
    // Testar suporte AVIF
    if (await this.supportsFormat('image/avif')) {
      return 'avif';
    }
    
    // Testar suporte WebP
    if (await this.supportsFormat('image/webp')) {
      return 'webp';
    }
    
    // Fallback para JPEG
    return 'jpeg';
  }

  /**
   * Testa se o navegador suporta um formato específico
   * @param mimeType Tipo MIME a ser testado
   * @returns Promise com resultado do teste
   */
  private async supportsFormat(mimeType: string): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      try {
        const dataURL = canvas.toDataURL(mimeType, 0.1);
        resolve(dataURL.indexOf(mimeType) !== -1);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Carrega uma imagem a partir de um arquivo
   * @param file Arquivo de imagem
   * @returns Promise com elemento Image
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calcula dimensões mantendo proporção
   * @param originalWidth Largura original
   * @param originalHeight Altura original
   * @param maxWidth Largura máxima
   * @param maxHeight Altura máxima
   * @returns Dimensões calculadas
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Redimensionar se necessário
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  /**
   * Redimensiona uma imagem usando Pica
   * @param image Elemento Image
   * @param width Nova largura
   * @param height Nova altura
   * @returns Promise com Blob redimensionado
   */
  private async resizeImage(image: HTMLImageElement, width: number, height: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível obter contexto do canvas');
    }

    // Usar Pica para redimensionamento de alta qualidade
    await this.pica.resize(image, canvas, {
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao converter canvas para blob'));
        }
      }, 'image/jpeg', this.DEFAULT_QUALITY);
    });
  }

  /**
   * Comprime uma imagem até atingir tamanho alvo
   * @param blob Blob da imagem
   * @param targetSizeBytes Tamanho alvo em bytes
   * @param format Formato desejado
   * @returns Promise com Blob comprimido
   */
  private async compressImage(blob: Blob, targetSizeBytes: number, format: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Tentar diferentes qualidades até atingir tamanho alvo
        let quality = this.DEFAULT_QUALITY;
        let compressedBlob: Blob | null = null;
        
        for (let i = 0; i < 10; i++) {
          compressedBlob = await this.canvasToBlob(canvas, format, quality);
          
          if (compressedBlob && compressedBlob.size <= targetSizeBytes) {
            resolve(compressedBlob);
            return;
          }
          
          quality -= 0.1;
          if (quality < 0.1) break;
        }
        
        // Se não conseguiu atingir tamanho alvo, retorna o menor possível
        resolve(compressedBlob || blob);
      };
      
      img.onerror = () => reject(new Error('Falha ao carregar imagem para compressão'));
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Converte canvas para blob com formato específico
   * @param canvas Canvas element
   * @param format Formato desejado
   * @param quality Qualidade (0-1)
   * @returns Promise com Blob
   */
  private async canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      const mimeType = `image/${format}`;
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });
  }

  /**
   * Valida se o arquivo é uma imagem válida
   * @param file Arquivo a ser validado
   * @returns true se for válido
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    return validTypes.includes(file.type) && file.size > 0;
  }

  /**
   * Gera nome de arquivo otimizado
   * @param originalName Nome original
   * @param format Formato final
   * @returns Nome otimizado
   */
  private generateOptimizedFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${nameWithoutExt}_optimized_${timestamp}.${format}`;
  }

  /**
   * Obtém dimensões recomendadas para um tipo de imagem
   * @param type Tipo da imagem
   * @returns Dimensões recomendadas
   */
  getRecommendedDimensions(type: string): { width: number; height: number } {
    return this.IMAGE_DIMENSIONS[type] || this.IMAGE_DIMENSIONS['about'];
  }

  /**
   * Formata tamanho em bytes para string legível
   * @param bytes Tamanho em bytes
   * @returns String formatada
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
