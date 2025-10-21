import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  alt: string;
}

export interface GalleryImage {
  thumbnail: string;
  full: string;
  alt: string;
  title: string;
}

export interface ChaletImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

export interface SimpleImage {
  url: string;
  alt: string;
}

export interface ConteudoSite {
  heroSlides?: HeroSlide[];
  galleryImages?: GalleryImage[];
  chaletImages?: ChaletImage[];
  aboutImage?: SimpleImage;
  baptismImage?: SimpleImage;
}

export interface UpdateConteudoSiteRequest {
  conteudoSite: ConteudoSite;
}

@Injectable({
  providedIn: 'root'
})
export class ConteudoService {
  private readonly API_URL = environment.apiUrl;
  
  private conteudoSubject = new BehaviorSubject<ConteudoSite>({});
  public conteudo$ = this.conteudoSubject.asObservable();

  constructor(private http: HttpClient) {
    this.carregarConteudo();
  }

  /**
   * Carregar conteúdo do site
   */
  carregarConteudo(): void {
    this.getConteudoSite().subscribe({
      next: (conteudo) => {
        this.conteudoSubject.next(conteudo);
      },
      error: (error) => {
        console.error('Erro ao carregar conteúdo:', error);
        // Usar dados padrão em caso de erro
        this.conteudoSubject.next(this.getConteudoPadrao());
      }
    });
  }

  /**
   * Obter conteúdo do site
   */
  getConteudoSite(): Observable<ConteudoSite> {
    return this.http.get<ConteudoSite>(`${this.API_URL}/configuracoes/conteudo-site`);
  }

  /**
   * Atualizar conteúdo do site
   */
  updateConteudoSite(conteudo: ConteudoSite): Observable<ConteudoSite> {
    const request: UpdateConteudoSiteRequest = { conteudoSite: conteudo };
    
    return this.http.patch<ConteudoSite>(`${this.API_URL}/configuracoes/conteudo-site`, request)
      .pipe(
        tap((novoConteudo) => {
          this.conteudoSubject.next(novoConteudo);
        })
      );
  }

  /**
   * Atualizar slides do hero
   */
  updateHeroSlides(slides: HeroSlide[]): Observable<ConteudoSite> {
    const conteudoAtual = this.conteudoSubject.value;
    const novoConteudo = { ...conteudoAtual, heroSlides: slides };
    return this.updateConteudoSite(novoConteudo);
  }

  /**
   * Atualizar imagens da galeria
   */
  updateGalleryImages(images: GalleryImage[]): Observable<ConteudoSite> {
    const conteudoAtual = this.conteudoSubject.value;
    const novoConteudo = { ...conteudoAtual, galleryImages: images };
    return this.updateConteudoSite(novoConteudo);
  }

  /**
   * Atualizar imagens dos chalés
   */
  updateChaletImages(images: ChaletImage[]): Observable<ConteudoSite> {
    const conteudoAtual = this.conteudoSubject.value;
    const novoConteudo = { ...conteudoAtual, chaletImages: images };
    return this.updateConteudoSite(novoConteudo);
  }

  /**
   * Atualizar imagem da seção About
   */
  updateAboutImage(image: SimpleImage): Observable<ConteudoSite> {
    const conteudoAtual = this.conteudoSubject.value;
    const novoConteudo = { ...conteudoAtual, aboutImage: image };
    return this.updateConteudoSite(novoConteudo);
  }

  /**
   * Atualizar imagem da seção Batismo
   */
  updateBaptismImage(image: SimpleImage): Observable<ConteudoSite> {
    const conteudoAtual = this.conteudoSubject.value;
    const novoConteudo = { ...conteudoAtual, baptismImage: image };
    return this.updateConteudoSite(novoConteudo);
  }

  /**
   * Obter conteúdo atual (síncrono)
   */
  getConteudoAtual(): ConteudoSite {
    return this.conteudoSubject.value;
  }

  /**
   * Obter slides do hero
   */
  getHeroSlides(): HeroSlide[] {
    return this.conteudoSubject.value.heroSlides || [];
  }

  /**
   * Obter imagens da galeria
   */
  getGalleryImages(): GalleryImage[] {
    return this.conteudoSubject.value.galleryImages || [];
  }

  /**
   * Obter imagens dos chalés
   */
  getChaletImages(): ChaletImage[] {
    return this.conteudoSubject.value.chaletImages || [];
  }

  /**
   * Obter imagem da seção About
   */
  getAboutImage(): SimpleImage | null {
    return this.conteudoSubject.value.aboutImage || null;
  }

  /**
   * Obter imagem da seção Batismo
   */
  getBaptismImage(): SimpleImage | null {
    return this.conteudoSubject.value.baptismImage || null;
  }

  /**
   * Dados padrão para fallback
   */
  private getConteudoPadrao(): ConteudoSite {
    return {
      heroSlides: [
        {
          image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop',
          title: 'Viva dias de descanso e conexão',
          subtitle: 'A natureza e o propósito em perfeita harmonia.',
          cta: 'Reservar agora',
          alt: 'Paisagem natural com lago e montanhas'
        },
        {
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
          title: 'Experiências que renovam corpo e alma',
          subtitle: 'Hospede-se, relaxe e desfrute de cada momento.',
          cta: 'Fazer minha reserva',
          alt: 'Chalés aconchegantes em meio à natureza'
        },
        {
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
          title: 'O lugar ideal para retiros, batismos e encontros especiais',
          subtitle: 'Estrutura completa, natureza viva e hospitalidade incomparável.',
          cta: 'Reservar sua data',
          alt: 'Cerimônia de batismo ao ar livre'
        }
      ],
      galleryImages: [
        {
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop',
          full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
          alt: 'Chalés aconchegantes em meio à natureza',
          title: 'Chalés Aconchegantes'
        },
        {
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=450&fit=crop',
          full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
          alt: 'Vista panorâmica da sede campestre',
          title: 'Vista Panorâmica'
        },
        {
          thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=450&fit=crop',
          full: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop',
          alt: 'Lago sereno para contemplação',
          title: 'Lago Sereno'
        }
      ],
      chaletImages: [
        {
          src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
          alt: 'Chalé 1 - Vista externa',
          title: 'Chalé Familiar',
          description: 'Chalé aconchegante ideal para famílias, com vista para o jardim e todas as comodidades necessárias para uma estadia confortável.'
        },
        {
          src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
          alt: 'Chalé 2 - Interior',
          title: 'Chalé Executivo',
          description: 'Chalé moderno e elegante, perfeito para executivos que buscam conforto e praticidade durante sua estadia.'
        }
      ],
      aboutImage: {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        alt: 'Sede campestre - Vista panorâmica'
      },
      baptismImage: {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        alt: 'Cerimônia de batismo ao ar livre'
      }
    };
  }
}
