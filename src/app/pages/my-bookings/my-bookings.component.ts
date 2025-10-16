import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  
  reservas: any[] = [];
  isLoading = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.scrollToTop();
    this.carregarReservas();
  }

  // Scroll para o topo da página
  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  carregarReservas(): void {
    this.isLoading = true;
    
    // Mock temporário - será substituído pela integração real
    setTimeout(() => {
      this.reservas = [
        {
          id: '1',
          codigo: 'RES1001',
          tipo: 'diaria',
          statusReserva: 'CONFIRMADA',
          dataInicio: new Date('2024-02-15'),
          dataFim: new Date('2024-02-15'),
          quantidadePessoas: 4,
          quantidadeChales: 1,
          valorTotal: 200,
          usuarioNome: 'João Silva',
          usuarioEmail: 'joao@email.com'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMADA':
        return 'green';
      case 'PENDENTE_PAGAMENTO':
        return 'orange';
      case 'CANCELADA':
        return 'red';
      case 'FINALIZADA':
        return 'blue';
      case 'EM_ANDAMENTO':
        return 'purple';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'PENDENTE_PAGAMENTO':
        return 'Pendente';
      case 'CANCELADA':
        return 'Cancelada';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      default:
        return status;
    }
  }
}