import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CancelReservationDialogComponent } from '../cancel-reservation-dialog/cancel-reservation-dialog.component';

export interface ReservationDetails {
  id: string;
  codigo: string;
  codigoAcesso: string;
  tipo: string;
  statusReserva: string;
  dataInicio: string;
  dataFim: string;
  quantidadeDiarias: number;
  quantidadePessoas: number;
  quantidadeChales: number;
  valorTotal: number;
  valorDiaria: number;
  valorDiariaComChale: number;
  usuario: {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    cpf: string;
  };
  pagamento: {
    id: string;
    status: string;
    modoPagamento: string;
    valor: number;
    parcelas: number;
    valorTotal: number;
    qtdParcelas: number;
    asaasPagamentoId: string;
    asaasInstallmentId?: string;
    linkPagamento: string;
    dataPagamento: string;
    estorno?: any;
  } | null;
  historico: Array<{
    data: string;
    acao: string;
    detalhes: string;
    estorno?: any;
  }>;
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

@Component({
  selector: 'app-reservation-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    ScrollPanelModule,
    ToastModule
  ],
  providers: [DialogService],
  templateUrl: './reservation-details-dialog.component.html',
  styleUrl: './reservation-details-dialog.component.scss'
})
export class ReservationDetailsDialogComponent implements OnInit {
  
  reserva: ReservationDetails | null = null;
  isLoading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.reserva = this.config.data?.reserva || null;
  }

  getTipoText(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'diaria': 'Diária',
      'chale': 'Chalé',
      'batismo': 'Batismo',
      'completo': 'Completo'
    };
    return tipos[tipo] || tipo;
  }

  getTipoSeverity(tipo: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined {
    const severities: { [key: string]: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined } = {
      'diaria': 'info',
      'chale': 'success',
      'batismo': 'warn',
      'completo': 'secondary'
    };
    return severities[tipo] || 'info';
  }

  getStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'CONFIRMADA': 'Confirmada',
      'PENDENTE': 'Pendente',
      'CANCELADA': 'Cancelada',
      'UTILIZADA': 'Utilizada'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined {
    const severities: { [key: string]: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined } = {
      'CONFIRMADA': 'success',
      'PENDENTE': 'warn',
      'CANCELADA': 'danger',
      'UTILIZADA': 'info'
    };
    return severities[status] || 'info';
  }

  getPaymentStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'CONFIRMADO': 'Confirmado',
      'RECEBIDO': 'Recebido',
      'CANCELADO': 'Cancelado',
      'ESTORNADO': 'Estornado'
    };
    return statuses[status] || status;
  }

  getPaymentStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined {
    const severities: { [key: string]: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | null | undefined } = {
      'PENDENTE': 'warn',
      'CONFIRMADO': 'success',
      'RECEBIDO': 'success',
      'CANCELADO': 'danger',
      'ESTORNADO': 'info'
    };
    return severities[status] || 'info';
  }

  getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'PIX': 'PIX',
      'CREDIT_CARD': 'Cartão de Crédito',
      'BOLETO': 'Boleto'
    };
    return methods[method] || method;
  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }

  getHistoricoOrdenado(): any[] {
    if (!this.reserva?.historico) return [];
    return [...this.reserva.historico].sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }

  canCancelReservation(): boolean {
    if (!this.reserva) return false;
    return this.reserva.statusReserva !== 'CANCELADA' && 
           this.reserva.statusReserva !== 'UTILIZADA';
  }

  canRefundPayment(): boolean {
    if (!this.reserva?.pagamento) return false;
    
    const pagamento = this.reserva.pagamento;
    
    // Verificar se pagamento foi confirmado
    if (pagamento.status !== 'CONFIRMADO' && pagamento.status !== 'RECEBIDO') {
      return false;
    }

    // Verificar se já foi estornado
    if ((pagamento.status as string) === 'ESTORNADO') {
      return false;
    }

    // Verificar prazo para estorno
    if (pagamento.dataPagamento) {
      const dataPagamento = new Date(pagamento.dataPagamento);
      const hoje = new Date();
      const diasDiferenca = Math.floor((hoje.getTime() - dataPagamento.getTime()) / (1000 * 60 * 60 * 24));

      // PIX: até 90 dias
      if (pagamento.modoPagamento === 'PIX' && diasDiferenca > 90) {
        return false;
      }

      // Cartão de crédito: até 180 dias
      if (pagamento.modoPagamento === 'CREDIT_CARD' && diasDiferenca > 180) {
        return false;
      }

      // Boleto: não elegível para estorno
      if (pagamento.modoPagamento === 'BOLETO') {
        return false;
      }
    }

    return true;
  }

  openCancelDialog(): void {
    if (!this.reserva) return;

    // Fechar o dialog de detalhes primeiro
    this.ref.close();

    // Abrir o dialog de cancelamento
    (this.dialogService as any).open(CancelReservationDialogComponent, {
      data: { reserva: this.reserva },
      width: '500px',
      header: 'Cancelar Reserva',
      modal: true,
      closable: true
    }).onClose.subscribe((result: any) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Reserva cancelada com sucesso!'
        });
      }
    });
  }

  closeDialog(): void {
    this.ref.close();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }
}
