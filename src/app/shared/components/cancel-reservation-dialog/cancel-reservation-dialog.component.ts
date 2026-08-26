import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ReservaService } from '../../../core/services/reserva.service';

export interface ReservationDetails {
  id: string;
  codigo: string;
  statusReserva: string;
  valorTotal: number;
  pagamento: {
    id: string;
    status: string;
    modoPagamento: string;
    valor: number;
    parcelas: number;
    valorTotal: number;
    qtdParcelas: number;
    asaasCheckoutSessionId: string;
    asaasInstallmentId?: string;
    linkPagamento: string;
    dataPagamento: string;
    estorno?: any;
  } | null;
}

@Component({
  selector: 'app-cancel-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ToastModule
  ],
  templateUrl: './cancel-reservation-dialog.component.html',
  styleUrl: './cancel-reservation-dialog.component.scss'
})
export class CancelReservationDialogComponent implements OnInit {
  
  reserva: ReservationDetails | null = null;
  formulario: FormGroup;
  isLoading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private messageService: MessageService
  ) {
    this.formulario = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      valorEstorno: [null]
    });
  }

  ngOnInit(): void {
    this.reserva = this.config.data?.reserva || null;

    // Pagamento já confirmado é sempre estornado ao cancelar — não é mais
    // uma escolha do admin (o backend também garante isso independente do
    // que for mandado aqui). O campo de valor continua editável só pra
    // permitir um estorno parcial, se for o caso.
    if (this.reserva?.pagamento && this.canRefundPayment()) {
      this.formulario.patchValue({
        valorEstorno: this.reserva.pagamento.valor
      });
      this.formulario.get('valorEstorno')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.formulario.get('valorEstorno')?.updateValueAndValidity();
    }
  }

  canRefundPayment(): boolean {
    if (!this.reserva?.pagamento) return false;
    
    const pagamento = this.reserva.pagamento;

    // Estorno só faz sentido para dinheiro que já entrou. Pagamento PENDENTE
    // (ainda não pago) é cancelado direto no Asaas, não estornado.
    if (pagamento.status !== 'CONFIRMADO' && pagamento.status !== 'RECEBIDO' && pagamento.status !== 'PAGO') {
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

  getStatusReservaText(status: string): string {
    const statuses: { [key: string]: string } = {
      'CONFIRMADA': 'Confirmada',
      'PENDENTE_PAGAMENTO': 'Pendente de Pagamento',
      'CANCELADA': 'Cancelada',
      'FINALIZADA': 'Finalizada',
      'EM_ANDAMENTO': 'Em Andamento',
      'UTILIZADA': 'Utilizada',
    };
    return statuses[status] || status;
  }

  getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'PIX': 'PIX',
      'CREDIT_CARD': 'Cartão de Crédito',
      'BOLETO': 'Boleto'
    };
    return methods[method] || method;
  }

  getPaymentStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'CONFIRMADO': 'Confirmado',
      'RECEBIDO': 'Recebido',
      'PAGO': 'Pago',
      'CANCELADO': 'Cancelado',
      'ESTORNADO': 'Estornado'
    };
    return statuses[status] || status;
  }

  getRefundInfo(): string {
    if (!this.reserva?.pagamento) return '';

    const pagamento = this.reserva.pagamento;

    if (pagamento.status === 'PENDENTE') {
      return 'Pagamento ainda não foi realizado, então não há valor a estornar. O link de pagamento expira sozinho e deixa de funcionar.';
    }

    if (pagamento.modoPagamento === 'PIX') {
      return 'PIX: Estorno imediato (até 90 dias após o pagamento)';
    } else if (pagamento.modoPagamento === 'CREDIT_CARD') {
      return 'Cartão de Crédito: Estorno em até 10 dias úteis (até 180 dias após o pagamento)';
    } else if (pagamento.modoPagamento === 'BOLETO') {
      return 'Boleto: Não elegível para estorno automático';
    }
    
    return '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  async cancelarReserva(): Promise<void> {
    if (this.formulario.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.reserva) return;

    this.isLoading = true;

    try {
      const dadosCancelamento = {
        motivo: this.formulario.value.motivo,
        estornarPagamento: this.canRefundPayment(),
        valorEstorno: this.formulario.value.valorEstorno
      };

      const resultado = await this.reservaService.cancelarReservaComEstorno(
        this.reserva.id,
        dadosCancelamento
      ).toPromise();

      if (resultado?.estorno) {
        this.mostrarMensagemEstorno(resultado.estorno);
      }

      // avisos: falhas não-bloqueantes (ex.: não conseguiu cancelar a
      // cobrança pendente no Asaas) — a reserva já foi cancelada mesmo
      // assim, mas o admin precisa saber que sobrou algo pra checar
      // manualmente no painel do Asaas.
      if (resultado?.avisos?.length) {
        for (const aviso of resultado.avisos) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso: cobrança não cancelada no Asaas',
            detail: this.formatarErroAsaas(aviso),
            life: 20000
          });
        }
      }

      // O toast de sucesso do cancelamento em si é responsabilidade de quem
      // abriu este dialog (AdminComponent), que também recarrega a lista.
      this.ref.close(resultado);

    } catch (error: any) {
      const asaasError = error.error?.asaasError;
      const mensagemBase = error.error?.message || 'Erro ao cancelar reserva. Tente novamente.';

      // Esta tela é exclusiva de admin autenticado (JwtAuthGuard+AdminGuard
      // no backend) — por isso mostramos o detalhe técnico completo aqui
      // (endpoint, método, ID usado, status e resposta do Asaas). Nenhuma
      // credencial (API key) trafega nesse payload.
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: asaasError ? `${mensagemBase}\n\n${this.formatarErroAsaas(asaasError)}` : mensagemBase,
        life: 20000
      });
    } finally {
      this.isLoading = false;
    }
  }

  // Status do estorno em si (refunds[].status do Asaas: PENDING/DONE/etc),
  // não confundir com status do pagamento (PENDENTE/CONFIRMADO/...).
  private formatarStatusEstorno(status: string): string {
    const statuses: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'AWAITING_CRITICAL_ACTION_AUTHORIZATION': 'Aguardando autorização',
      'AWAITING_CUSTOMER_EXTERNAL_AUTHORIZATION': 'Aguardando autorização do cliente',
      'CANCELLED': 'Cancelado',
      'DONE': 'Concluído',
      'REFUNDED': 'Estornado',
      'ESTORNADO': 'Estornado'
    };
    return statuses[status] || status || 'Processado';
  }

  private formatarErroAsaas(asaasError: any): string {
    if (!asaasError) return '';
    const partes = [
      `Endpoint: ${asaasError.method || ''} ${asaasError.endpoint || ''}`,
      `Status HTTP: ${asaasError.httpStatus ?? 'N/A'}`,
      `Resposta do Asaas: ${JSON.stringify(asaasError.asaasResponse ?? asaasError.originalMessage ?? 'sem detalhes')}`
    ];
    return partes.join('\n');
  }

  private mostrarMensagemEstorno(estorno: any): void {
    // Verificar se o estorno tem dados válidos
    if (!estorno || estorno.error) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Estorno',
        detail: estorno?.error || 'Erro ao processar estorno'
      });
      return;
    }

    const valor = estorno.value || estorno.valor || 0;
    const status = this.formatarStatusEstorno(estorno.status);
    const data = estorno.dateCreated || estorno.dataEstorno || new Date();
    const qtdParcelas = this.reserva?.pagamento?.qtdParcelas || 0;
    const parcelasEstornadas = estorno.qtdParcelasEstornadas || qtdParcelas;

    const mensagem = `
      Estorno processado com sucesso!
      ${qtdParcelas > 1 ? `Todas as ${parcelasEstornadas} parcelas foram estornadas.\n      ` : ''}Valor${qtdParcelas > 1 ? ' (total)' : ''}: ${this.formatCurrency(valor)}
      Status: ${status}
      Data: ${new Date(data).toLocaleDateString('pt-BR')}
    `;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Estorno Processado',
      detail: mensagem,
      life: 10000
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
    });
  }

  fecharDialog(): void {
    this.ref.close();
  }

  getFieldError(fieldName: string): string {
    const field = this.formulario.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${fieldName} deve ser maior que ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}