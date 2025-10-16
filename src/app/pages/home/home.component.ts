import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    CarouselModule,
    ChipModule,
    BadgeModule,
    DividerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  isBrowser = false;
  
  // Dados do carrossel de imagens
  carouselImages = [
    {
      src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop&crop=center',
      alt: 'Chácara da Igreja - Vista Principal',
      title: 'Bem-vindo ao Refúgio de Paz',
      subtitle: 'Um lugar especial para momentos únicos e celebrações memoráveis'
    },
    {
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop&crop=center',
      alt: 'Chácara da Igreja - Área de Lazer',
      title: 'Natureza e Tranquilidade',
      subtitle: 'Conecte-se com o que realmente importa em meio à natureza'
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=600&fit=crop&crop=center',
      alt: 'Chácara da Igreja - Salão de Eventos',
      title: 'Celebre Seus Momentos',
      subtitle: 'Espaços perfeitos para suas celebrações mais especiais'
    },
    {
      src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop&crop=center',
      alt: 'Chácara da Igreja - Churrasqueira',
      title: 'Momentos em Família',
      subtitle: 'Confraternize em um ambiente acolhedor e familiar'
    },
    {
      src: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=600&fit=crop&crop=center',
      alt: 'Chácara da Igreja - Jardim',
      title: 'Ambiente Natural',
      subtitle: 'Respire ar puro e desfrute da natureza exuberante'
    }
  ];

  // Características da chácara
  features = [
    {
      icon: 'pi pi-home',
      title: 'Acomodações Confortáveis',
      description: 'Chalés e quartos equipados para sua comodidade'
    },
    {
      icon: 'pi pi-calendar',
      title: 'Eventos Especiais',
      description: 'Batismos, casamentos e celebrações memoráveis'
    },
    {
      icon: 'pi pi-users',
      title: 'Espaços Amplos',
      description: 'Salões e áreas para grupos grandes'
    },
    {
      icon: 'pi pi-heart',
      title: 'Ambiente Familiar',
      description: 'Um lugar acolhedor para toda a família'
    }
  ];

  // Tipos de reserva disponíveis
  tiposReserva = [
    {
      tipo: 'diaria',
      titulo: 'Diária Completa',
      descricao: 'Aproveite um dia inteiro na chácara com todas as comodidades',
      preco: 'A partir de R$ 1.000',
      icon: 'pi pi-sun'
    },
    {
      tipo: 'chale',
      titulo: 'Hospedagem em Chalé',
      descricao: 'Pernoitada em nossos chalés aconchegantes',
      preco: 'R$ 150 por chalé',
      icon: 'pi pi-home'
    },
    {
      tipo: 'batismo',
      titulo: 'Cerimônia de Batismo',
      descricao: 'Celebre este momento especial em nossa capela',
      preco: 'R$ 300',
      icon: 'pi pi-heart'
    }
  ];

  // Depoimentos
  depoimentos = [
    {
      nome: 'Maria Silva',
      texto: 'Um lugar maravilhoso para celebrar momentos especiais. A equipe é muito atenciosa e o ambiente é perfeito para a família.',
      avaliacao: 5
    },
    {
      nome: 'João Santos',
      texto: 'A chácara da igreja é um refúgio de paz. Recomendo para quem busca tranquilidade e conexão espiritual.',
      avaliacao: 5
    },
    {
      nome: 'Ana Costa',
      texto: 'Celebramos o batismo do nosso filho aqui e foi uma experiência inesquecível. Muito especial!',
      avaliacao: 5
    }
  ];

  // Dados dos chalés
  chales = [
    {
      id: 1,
      nome: 'Chalé da Família',
      imagens: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
      ],
      amenidades: [
        { icon: 'pi pi-bed', nome: '2 Quartos' },
        { icon: 'pi pi-users', nome: 'Até 6 pessoas' },
        { icon: 'pi pi-wifi', nome: 'Wi-Fi gratuito' },
        { icon: 'pi pi-car', nome: 'Estacionamento' },
        { icon: 'pi pi-snowflake', nome: 'Ar condicionado' },
        { icon: 'pi pi-home', nome: 'Cozinha equipada' }
      ],
      preco: 'R$ 150/dia'
    },
    {
      id: 2,
      nome: 'Chalé do Casal',
      imagens: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'
      ],
      amenidades: [
        { icon: 'pi pi-bed', nome: '1 Quarto' },
        { icon: 'pi pi-users', nome: 'Até 2 pessoas' },
        { icon: 'pi pi-wifi', nome: 'Wi-Fi gratuito' },
        { icon: 'pi pi-car', nome: 'Estacionamento' },
        { icon: 'pi pi-snowflake', nome: 'Ar condicionado' },
        { icon: 'pi pi-heart', nome: 'Romântico' }
      ],
      preco: 'R$ 150/dia'
    },
    {
      id: 3,
      nome: 'Chalé dos Amigos',
      imagens: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'
      ],
      amenidades: [
        { icon: 'pi pi-bed', nome: '3 Quartos' },
        { icon: 'pi pi-users', nome: 'Até 8 pessoas' },
        { icon: 'pi pi-wifi', nome: 'Wi-Fi gratuito' },
        { icon: 'pi pi-car', nome: 'Estacionamento' },
        { icon: 'pi pi-snowflake', nome: 'Ar condicionado' },
        { icon: 'pi pi-users', nome: 'Área social' }
      ],
      preco: 'R$ 150/dia'
    }
  ];

  ngOnInit(): void {
    // Inicialização do componente
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
}
