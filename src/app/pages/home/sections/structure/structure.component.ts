import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';

interface StructureFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export class StructureComponent {
  @Output() bookingClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  features: StructureFeature[] = [
    {
      icon: 'pi pi-home',
      title: 'Chalés aconchegantes',
      description: 'Acomodações confortáveis com vista para a natureza'
    },
    {
      icon: 'pi pi-sun',
      title: 'Piscina e campo gramado',
      description: 'Área de lazer completa para relaxar e se divertir'
    },
    {
      icon: 'pi pi-receipt',
      title: 'Cozinha equipada',
      description: 'Estrutura completa para preparar suas refeições'
    },
    {
      icon: 'pi pi-users',
      title: 'Salão de eventos',
      description: 'Espaço amplo para reuniões e celebrações'
    },
    {
      icon: 'pi pi-heart',
      title: 'Parquinho para crianças',
      description: 'Espaço amplo para crianças se divertirem'
    },
    {
      icon: 'pi pi-calendar-plus',
      title: 'Sistema de reservas rápido',
      description: 'Agendamento simples e confirmação instantânea'
    }
  ];

  goToBooking(): void {
    this.bookingClick.emit();
    this.router.navigate(['/booking']);
  }
}
