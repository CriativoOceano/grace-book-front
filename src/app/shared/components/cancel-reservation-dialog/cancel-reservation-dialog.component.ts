import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
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
    asaasPagamentoId: string;
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
    CheckboxModule,
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
      estornarPagamento: [false],
      valorEstorno: [null]
    });
  }

  ngOnInit(): void {
    this.reserva = this.config.data?.reserva || null;
    
    if (this.reserva?.pagamento) {
      // Definir valor padrão do estorno como valor total
      this.formulario.patchValue({
        valorEstorno: this.reserva.pagamento.valor
      });
    }

    // Observar mudanças no checkbox de estorno
    this.formulario.get('estornarPagamento')?.valueChanges.subscribe(value => {
      const valorEstornoControl = this.formulario.get('valorEstorno');
      if (value) {
        valorEstornoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        valorEstornoControl?.clearValidators();
      }
      valorEstornoControl?.updateValueAndValidity();
    });
  }

  canRefundPayment(): boolean {
    if (!this.reserva?.pagamento) return false;
    
    const pagamento = this.reserva.pagamento;
    
    // Verificar se pagamento foi confirmado
    if (pagamento.status !== 'CONFIRMADO' && pagamento.status !== 'RECEBIDO' && pagamento.status !== 'PAGO' && pagamento.status !== 'PENDENTE') {
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
        estornarPagamento: this.formulario.value.estornarPagamento,
        valorEstorno: this.formulario.value.valorEstorno
      };

      const resultado = await this.reservaService.cancelarReservaComEstorno(
        this.reserva.id,
        dadosCancelamento
      ).toPromise();

      if (resultado?.estorno) {
        this.mostrarMensagemEstorno(resultado.estorno);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Reserva cancelada com sucesso!'
      });

      this.ref.close(resultado);

    } catch (error: any) {
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.error?.message || 'Erro ao cancelar reserva. Tente novamente.'
      });
    } finally {
      this.isLoading = false;
    }
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
    const status = estorno.status || 'Processado';
    const data = estorno.dateCreated || estorno.dataEstorno || new Date();
    
    const mensagem = `
      Estorno processado com sucesso!
      Valor: ${this.formatCurrency(valor)}
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