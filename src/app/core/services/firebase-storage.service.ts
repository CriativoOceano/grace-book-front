import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, StorageReference } from 'firebase/storage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  private storage: any;

  constructor() {
    // Inicializar Firebase
    const app = initializeApp(environment.firebase);
    this.storage = getStorage(app);
  }

  /**
   * Upload de imagem para o Firebase Storage
   * @param file Arquivo de imagem (máximo 9MB)
   * @param path Caminho onde salvar (ex: 'hero/slide1.jpg')
   * @returns Promise com URL de download
   */
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      // Validar tipo de arquivo
      if (!this.isValidImageType(file)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.');
      }

      // Validar tamanho (9MB máximo)
      if (file.size > 9 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 9MB.');
      }

      // Criar referência do arquivo
      const storageRef = ref(this.storage, path);
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  /**
   * Deletar imagem do Firebase Storage
   * @param url URL da imagem a ser deletada
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // Extrair o caminho da URL
      const path = this.extractPathFromUrl(url);
      if (!path) {
        throw new Error('URL inválida');
      }

      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  }

  /**
   * Obter URL de download de uma imagem
   * @param path Caminho da imagem no storage
   * @returns Promise com URL de download
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Erro ao obter URL:', error);
      throw error;
    }
  }

  /**
   * Validar se o arquivo é uma imagem válida
   * @param file Arquivo a ser validado
   * @returns true se for uma imagem válida
   */
  private isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Extrair caminho da URL do Firebase Storage
   * @param url URL completa da imagem
   * @returns Caminho relativo no storage
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
      return null;
    }
  }

  /**
   * Gerar nome único para arquivo
   * @param originalName Nome original do arquivo
   * @param folder Pasta onde será salvo
   * @returns Nome único para o arquivo
   */
  generateUniqueFileName(originalName: string, folder: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${folder}/${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Obter dimensões recomendadas para cada tipo de imagem
   * @param type Tipo da imagem (hero, gallery, chalet, etc.)
   * @returns Objeto com largura e altura recomendadas
   */
  getRecommendedDimensions(type: string): { width: number; height: number } {
    const dimensions: { [key: string]: { width: number; height: number } } = {
      hero: { width: 1920, height: 1080 },
      gallery: { width: 1200, height: 800 },
      galleryThumbnail: { width: 600, height: 450 },
      chalet: { width: 800, height: 600 },
      about: { width: 800, height: 600 },
      baptism: { width: 800, height: 600 }
    };

    return dimensions[type] || { width: 800, height: 600 };
  }

  /**
   * Teste de conectividade com Firebase Storage
   */
  async testConnection(): Promise<boolean> {
    try {
      const testRef = ref(this.storage, 'test/connection.txt');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      await uploadBytes(testRef, testBlob);
      await deleteObject(testRef);
      return true;
    } catch (error) {
      console.error('Erro de conexão com Firebase Storage:', error);
      return false;
    }
  }
}
