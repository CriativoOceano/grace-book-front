import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BookingRequest {
  // Dados da reserva (formato do backend)
  tipo: string;
  dataInicio: string;
  dataFim: string;
  quantidadePessoas?: number;
  quantidadeChales?: number;
  observacoes?: string;
  
  // Dados do pagamento
  dadosPagamento: {
    modoPagamento: string;
    tipoPagamento?: string;
    parcelas?: number;
    valorTotal: number;
  };
  
  // Dados do hóspede para criar usuário automaticamente
  dadosHospede?: {
    nome: string;
    sobrenome: string;
    email: string;
    cpf: string;
    telefone: string;
    observacoes?: string;
    endereco?: string;
    numero?: string;
    cep?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
}

export interface VerificarDisponibilidadeRequest {
  dataInicio: string;
  dataFim: string;
  tipo: string;
  quantidadeChales?: number;
}

export interface CotarReservaRequest {
  tipo: string;
  dataInicio: string;
  dataFim: string;
  quantidadePessoas?: number;
  quantidadeChales?: number;
  observacoes?: string;
}

export interface CotarReservaResponse {
  valorTotal: number;
  detalhes?: string;
}

export interface VerificarDisponibilidadeResponse {
  disponivel: boolean;
  mensagem?: string;
}

export interface BookingResponse {
  reserva: {
    _id: string;
    codigo: string;
    codigoAcesso: string;
    usuario: {
      _id: string;
      nome: string;
      sobrenome: string;
      email: string;
      cpf: string;
      telefone: string;
      senha: string;
      isAdmin: boolean;
      dataCadastro: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    usuarioEmail: string;
    usuarioNome: string;
    tipo: string;
    statusReserva: string;
    dataInicio: string;
    dataFim: string;
    quantidadePessoas: number;
    quantidadeChales: number;
    quantidadeDiarias: number;
    valorTotal: number;
    dadosPagamento: {
      modoPagamento: string;
      parcelas: string;
      valorTotal: number;
    };
    observacoes: string;
    historico: Array<{
      data: string;
      acao: string;
      detalhes: string;
    }>;
    dataCriacao: string;
    dataAtualizacao: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  pagamento: {
    reservaId: string;
    status: string;
    modoPagamento: string;
    asaasPagamentoId: string;
    valorTotal: number;
    qtdParcelas: number;
    detalhes: {
      id: string;
      link: string;
      status: string;
      minutesToExpire: number;
      externalReference: any;
      billingTypes: string[];
      chargeTypes: string[];
      callback: {
        cancelUrl: string;
        successUrl: string;
        expiredUrl: string;
      };
      items: Array<{
        name: string;
        description: string;
        externalReference: any;
        quantity: number;
        value: number;
      }>;
      subscription: any;
      installment: any;
      split: any;
      customer: any;
      customerData: any;
    };
    linkPagamento: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Criar reserva completa (cliente + pagamento) via backend - SEM AUTENTICAÇÃO
   */
  createBooking(bookingData: BookingRequest): Observable<BookingResponse> {
    const url = `${this.baseUrl}/reservas/publico`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });


    return this.http.post<BookingResponse>(url, bookingData, { headers }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao criar reserva:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Verificar status de uma reserva
   */
  getBookingStatus(bookingId: string): Observable<BookingResponse> {
    const url = `${this.baseUrl}/reservas/${bookingId}`;
    
    return this.http.get<BookingResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancelar uma reserva
   */
  cancelBooking(bookingId: string): Observable<BookingResponse> {
    const url = `${this.baseUrl}/reservas/${bookingId}/cancelar`;
    
    return this.http.post<BookingResponse>(url, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar reservas do usuário
   */
  getUserBookings(email: string): Observable<BookingResponse> {
    const url = `${this.baseUrl}/reservas/minhas`;
    
    return this.http.get<BookingResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verificar disponibilidade de datas
   */
  verificarDisponibilidade(request: VerificarDisponibilidadeRequest): Observable<VerificarDisponibilidadeResponse> {
    const url = `${this.baseUrl}/reservas/disponibilidade`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });


    return this.http.post<VerificarDisponibilidadeResponse>(url, request, { headers }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao verificar disponibilidade:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Cotar valor da reserva - SEM AUTENTICAÇÃO
   */
  cotarReserva(request: CotarReservaRequest): Observable<CotarReservaResponse> {
    const url = `${this.baseUrl}/reservas/cotar-publico`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });


    return this.http.post<CotarReservaResponse>(url, request, { headers }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao cotar reserva:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Buscar reservas confirmadas para bloquear datas no calendário
   */
  getReservasConfirmadas(): Observable<any[]> {
    const url = `${this.baseUrl}/reservas/confirmadas`;
    
    return this.http.get<any[]>(url).pipe(
      tap(response => {
        // Resposta recebida do backend
      }),
      catchError(error => {
        console.error('❌ Erro na requisição:', error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no BookingService:', error);
    let errorMessage = 'Ocorreu um erro desconhecido.';
    
    if (error.error && typeof error.error === 'string' && error.error.includes('<!DOCTYPE')) {
      errorMessage = 'Erro de conexão com o backend. Verifique se o servidor está rodando na porta 3000.';
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
    } else if (error.status === 404) {
      errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
