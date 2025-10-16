import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-admin',
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
    NzStatisticModule,
    NzGridModule,
    NzSpinModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  
  reservas: any[] = [];
  isLoading = false;
  estatisticas = {
    totalReservas: 0,
    reservasConfirmadas: 0,
    reservasPendentes: 0,
    valorTotal: 0
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.scrollToTop();
    this.carregarDados();
  }

  // Scroll para o topo da página
  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  carregarDados(): void {
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
        },
        {
          id: '2',
          codigo: 'RES1002',
          tipo: 'batismo',
          statusReserva: 'PENDENTE_PAGAMENTO',
          dataInicio: new Date('2024-02-20'),
          dataFim: new Date('2024-02-20'),
          quantidadePessoas: 8,
          quantidadeChales: 0,
          valorTotal: 300,
          usuarioNome: 'Maria Santos',
          usuarioEmail: 'maria@email.com'
        }
      ];
      this.calcularEstatisticas();
      this.isLoading = false;
    }, 1000);
  }

  private calcularEstatisticas(): void {
    this.estatisticas.totalReservas = this.reservas.length;
    this.estatisticas.reservasConfirmadas = this.reservas.filter(r => r.statusReserva === 'CONFIRMADA').length;
    this.estatisticas.reservasPendentes = this.reservas.filter(r => r.statusReserva === 'PENDENTE_PAGAMENTO').length;
    this.estatisticas.valorTotal = this.reservas.reduce((total, r) => total + r.valorTotal, 0);
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