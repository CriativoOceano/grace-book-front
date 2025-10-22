import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingService, BookingRequest, BookingResponse } from './booking.service';
import { environment } from '../../environments/environment';

export interface PaymentRequest {
  // Dados da reserva
  tipo: string;
  periodoReserva: string;
  quantidadePessoas: number;
  quantidadeChales: number;
  observacoes?: string;
  
  // Dados do hóspede
  nomeHospede: string;
  sobrenomeHospede: string;
  emailHospede: string;
  telefoneHospede: string;
  observacoesHospede?: string;
  
  // Dados do pagamento
  modoPagamento: string;
  parcelas?: number;
  
  // URLs de retorno
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    bookingId: string;
    customerId: string;
    paymentId: string;
    checkoutUrl: string;
    qrCode?: string;
    pixCode?: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private bookingService: BookingService) {}

  /**
   * Criar pagamento completo via backend
   * O backend irá:
   * 1. Criar o cliente no ASAAS
   * 2. Criar o pagamento no ASAAS
   * 3. Retornar a URL do checkout
   */
  createPaymentWithCustomerData(
    customerData: any,
    amount: number,
    description: string,
    dueDate: string,
    successUrl: string,
    externalReference?: string
  ): Observable<BookingResponse> {
    // Preparar dados para o backend
    const bookingRequest: BookingRequest = {
      // Dados da reserva (vêm do formulário)
      tipo: customerData.tipo || 'DIARIA',
      dataInicio: customerData.dataInicio || '',
      dataFim: customerData.dataFim || '',
      quantidadePessoas: customerData.quantidadePessoas || 1,
      quantidadeChales: customerData.quantidadeChales || 1,
      observacoes: customerData.observacoes || '',
      
      // Dados do pagamento
      dadosPagamento: {
        modoPagamento: customerData.modoPagamento || 'PIX',
        tipoPagamento: (customerData.parcelas && customerData.parcelas > 1) ? 'PARCELADO' : 'AVISTA',
        parcelas: customerData.parcelas || 1,
        valorTotal: amount
      }
    };

    return this.bookingService.createBooking(bookingRequest).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Criar pagamento com checkout baseado no modo selecionado
   */
  createCheckoutPaymentByMode(
    modoPagamento: string, 
    customerData: any, 
    successUrl: string
  ): Observable<BookingResponse> {
    
    // Calcular valor (isso deve vir do componente)
    const amount = customerData.valorCalculado || 1000; // Valor padrão para teste
    const description = `Reserva - ${customerData.tipo || 'Diária Completa'}`;
    const dueDate = this.getDueDate();
    const externalReference = this.generateExternalReference();

    return this.createPaymentWithCustomerData(
      customerData,
      amount,
      description,
      dueDate,
      successUrl,
      externalReference
    );
  }

  /**
   * Verificar status de uma reserva
   */
  getBookingStatus(bookingId: string): Observable<BookingResponse> {
    return this.bookingService.getBookingStatus(bookingId);
  }

  /**
   * Cancelar uma reserva
   */
  cancelBooking(bookingId: string): Observable<BookingResponse> {
    return this.bookingService.cancelBooking(bookingId);
  }

  /**
   * Listar reservas do usuário
   */
  getUserBookings(email: string): Observable<BookingResponse> {
    return this.bookingService.getUserBookings(email);
  }

  /**
   * Verificar status de um pagamento específico
   */
  checkPaymentStatus(paymentId: string): Observable<any> {
    // Este método deveria fazer uma chamada para o ASAAS para verificar o status
    // Por enquanto, vamos retornar um mock
    
    return new Observable(observer => {
      setTimeout(() => {
        // Mock da resposta do ASAAS
        const mockPayment = {
          id: paymentId,
          status: 'RECEIVED',
          value: 2650,
          paymentDate: new Date().toISOString(),
          dueDate: new Date().toISOString()
        };
        observer.next(mockPayment);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Gerar chave de idempotência
   */
  private generateIdempotencyKey(type: string, identifier: string, amount: number, dueDate: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${type}_${identifier}_${amount}_${dueDate}_${timestamp}_${random}`;
  }

  /**
   * Gerar referência externa
   */
  private generateExternalReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GRACE_${timestamp}_${random}`;
  }

  /**
   * Obter data de vencimento (7 dias a partir de hoje)
   */
  private getDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }
}