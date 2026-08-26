import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';

// Services
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    DividerModule,
    BadgeModule
  ],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit {
  
  isLoading = true;
  errorMessage = '';
  paymentData: any = null;
  paymentStatus: 'sucesso' | 'cancelado' | 'expirado' | 'pendente' = 'pendente';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private bookingService: BookingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  codigoReserva: string | null = null;
  isLoadingReserva = false;

  ngOnInit(): void {
    this.checkPaymentStatus();
  }

  checkPaymentStatus(): void {
    // Verificar parâmetros da URL
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      this.codigoReserva = params['codigo'] || null;

      switch (status) {
        case 'sucesso':
          this.paymentStatus = 'sucesso';
          this.handleSuccessStatus();
          break;
        case 'cancelado':
          this.paymentStatus = 'cancelado';
          this.handleCancelledStatus();
          break;
        case 'expirado':
          this.paymentStatus = 'expirado';
          this.handleExpiredStatus();
          break;
        default:
          this.paymentStatus = 'pendente';
          this.handlePendingStatus();
      }

      this.isLoading = false;
    });
  }

  // Busca os dados reais da reserva pelo código que o backend agora inclui
  // na URL de retorno do checkout do Asaas. Se por algum motivo o código não
  // vier (link antigo, ou o backend ainda não foi atualizado), paymentData
  // fica nulo e o template cai no aviso genérico de "consulte pelo código".
  private carregarDadosDaReserva(): void {
    if (!this.codigoReserva) {
      this.paymentData = null;
      return;
    }

    this.isLoadingReserva = true;
    this.bookingService.buscarReservaPorCodigo(this.codigoReserva).subscribe({
      next: (reserva) => {
        this.paymentData = reserva;
        this.isLoadingReserva = false;
      },
      error: () => {
        this.paymentData = null;
        this.isLoadingReserva = false;
      }
    });
  }

  private handleSuccessStatus(): void {
    this.carregarDadosDaReserva();

    this.messageService.add({
      severity: 'success',
      summary: 'Pagamento Confirmado!',
      detail: 'Sua reserva foi confirmada com sucesso.'
    });
  }

  // O Asaas manda o cliente pra cá com "?status=sucesso" assim que o
  // checkout é pago — mas a confirmação de verdade da reserva depende do
  // webhook, que roda separado. Se nesse meio-tempo a reserva expirou (ou
  // foi cancelada por outro motivo) e não deu pra reaproveitar a data, o
  // backend estorna automaticamente e marca a reserva como cancelada,
  // mesmo com o Asaas tendo redirecionado como "sucesso". Aqui a gente
  // confere o status real da reserva pra não mostrar "confirmado" pra
  // quem teve o dinheiro devolvido.
  get reservaFoiEstornada(): boolean {
    return this.paymentData?.statusReserva === 'CANCELADA';
  }

  private handleCancelledStatus(): void {
    this.errorMessage = 'Pagamento foi cancelado pelo usuário.';
    
    this.messageService.add({
      severity: 'warn',
      summary: 'Pagamento Cancelado',
      detail: 'Você cancelou o pagamento. Sua reserva não foi confirmada.'
    });
  }

  private handleExpiredStatus(): void {
    this.errorMessage = 'O prazo para pagamento expirou.';
    
    this.messageService.add({
      severity: 'error',
      summary: 'Pagamento Expirado',
      detail: 'O prazo para pagamento expirou. Você pode tentar novamente.'
    });
  }

  private handlePendingStatus(): void {
    this.carregarDadosDaReserva();
  }

  getStatusIcon(): string {
    switch (this.paymentStatus) {
      case 'sucesso':
        return 'pi pi-check-circle';
      case 'cancelado':
        return 'pi pi-times-circle';
      case 'expirado':
        return 'pi pi-exclamation-triangle';
      case 'pendente':
        return 'pi pi-clock';
      default:
        return 'pi pi-info-circle';
    }
  }

  getStatusColor(): string {
    switch (this.paymentStatus) {
      case 'sucesso':
        return '#10b981';
      case 'cancelado':
        return '#ef4444';
      case 'expirado':
        return '#f59e0b';
      case 'pendente':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  getStatusMessage(): string {
    switch (this.paymentStatus) {
      case 'sucesso':
        return 'Pagamento Confirmado!';
      case 'cancelado':
        return 'Pagamento Cancelado';
      case 'expirado':
        return 'Pagamento Expirado';
      case 'pendente':
        return 'Pagamento em Processamento';
      default:
        return 'Status do Pagamento';
    }
  }

  getStatusDescription(): string {
    switch (this.paymentStatus) {
      case 'sucesso':
        return 'Sua reserva foi confirmada com sucesso! Você receberá um email de confirmação em breve.';
      case 'cancelado':
        return 'Você cancelou o pagamento. Sua reserva não foi confirmada.';
      case 'expirado':
        return 'O prazo para pagamento expirou. Você pode tentar fazer uma nova reserva.';
      case 'pendente':
        return 'Seu pagamento está sendo processado. Aguarde a confirmação.';
      default:
        return 'Verificando status do pagamento...';
    }
  }

  getStatusBadgeSeverity(): string {
    switch (this.paymentStatus) {
      case 'sucesso':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'expirado':
        return 'warning';
      case 'pendente':
        return 'info';
      default:
        return 'secondary';
    }
  }

  goToBookings(): void {
    this.router.navigate(['/consultar-reserva']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  retryPayment(): void {
    this.router.navigate(['/booking']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    // Datas de reserva são guardadas como meia-noite UTC — formatar em
    // UTC evita que o dia mude dependendo do fuso do navegador, e como é
    // sempre meia-noite, mostrar o horário só adicionava "00:00" sem
    // informação nenhuma.
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }
}