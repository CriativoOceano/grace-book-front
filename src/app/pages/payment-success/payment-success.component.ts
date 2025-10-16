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

  ngOnInit(): void {
    this.checkPaymentStatus();
  }

  checkPaymentStatus(): void {
    // Verificar parâmetros da URL
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      
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

  private handleSuccessStatus(): void {
    // Simular dados de pagamento bem-sucedido
    this.paymentData = {
      id: 'PAY_' + Date.now(),
      value: 1500.00,
      status: 'PAGO',
      paymentDate: new Date().toISOString(),
      method: 'PIX'
    };
    
    this.messageService.add({
      severity: 'success',
      summary: 'Pagamento Confirmado!',
      detail: 'Sua reserva foi confirmada com sucesso.'
    });
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
    // Simular dados de pagamento pendente
    this.paymentData = {
      id: 'PAY_' + Date.now(),
      value: 1500.00,
      status: 'PENDENTE',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias
    };
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
    this.router.navigate(['/my-bookings']);
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}