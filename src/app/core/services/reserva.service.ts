import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface Reserva {
  id: string;
  codigo: string;
  codigoAcesso: string;
  tipo: TipoReserva;
  statusReserva: StatusReserva;
  dataInicio: Date;
  dataFim: Date;
  quantidadePessoas: number;
  quantidadeChales: number;
  quantidadeDiarias: number;
  valorTotal: number;
  observacoes?: string;
  usuarioNome: string;
  usuarioEmail: string;
  dataCriacao: Date;
}

export enum TipoReserva {
  DIARIA = 'diaria',
  CHALE = 'chale',
  BATISMO = 'batismo',
  COMPLETO = 'completo'
}

export enum StatusReserva {
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
  PENDENTE = 'PENDENTE_PAGAMENTO',
  EM_ANDAMENTO = 'EM_ANDAMENTO'
}

export interface CreateReservaDto {
  tipo: TipoReserva;
  dadosPagamento: any;
  dataInicio: Date;
  dataFim?: Date;
  quantidadePessoas?: number;
  quantidadeDiarias?: number;
  quantidadeChales?: number;
  observacoes?: string;
}

export interface VerificarDisponibilidadeDto {
  dataInicio: Date;
  dataFim: Date;
  tipo: TipoReserva;
  quantidadeChales?: number;
}

export interface DisponibilidadeResponse {
  disponivel: boolean;
  mensagem?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  verificarDisponibilidade(dados: VerificarDisponibilidadeDto): Observable<DisponibilidadeResponse> {
    return this.http.post<DisponibilidadeResponse>(
      `${this.API_URL}/reservas/disponibilidade`, 
      dados
    );
  }

  criarReserva(dados: CreateReservaDto): Observable<{ reserva: Reserva; pagamento: any }> {
    return this.http.post<{ reserva: Reserva; pagamento: any }>(
      `${this.API_URL}/reservas`,
      dados,
      { headers: this.getHeaders() }
    );
  }

  getMinhasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(
      `${this.API_URL}/reservas/minhas`,
      { headers: this.getHeaders() }
    );
  }

  getReservaPorCodigo(codigo: string): Observable<Reserva> {
    return this.http.get<Reserva>(
      `${this.API_URL}/reservas/codigo/${codigo}`,
      { headers: this.getHeaders() }
    );
  }

  cancelarReserva(id: string, motivo: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/reservas/${id}/cancelar`,
      { motivo },
      { headers: this.getHeaders() }
    );
  }

  // Métodos administrativos
  getAllReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(
      `${this.API_URL}/reservas`,
      { headers: this.getHeaders() }
    );
  }

  getReservaById(id: string): Observable<Reserva> {
    return this.http.get<Reserva>(
      `${this.API_URL}/reservas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  atualizarReserva(id: string, dados: Partial<Reserva>): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.API_URL}/reservas/${id}`,
      dados,
      { headers: this.getHeaders() }
    );
  }

  // Novos métodos para detalhes e cancelamento com estorno
  getReservationDetails(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}/reservas/${id}/detalhes`,
      { headers: this.getHeaders() }
    );
  }

  cancelarReservaComEstorno(
    id: string, 
    dadosCancelamento: { motivo: string; estornarPagamento?: boolean; valorEstorno?: number }
  ): Observable<{ reserva: any; estorno?: any }> {
    return this.http.post<{ reserva: any; estorno?: any }>(
      `${this.API_URL}/reservas/${id}/cancelar`,
      dadosCancelamento,
      { headers: this.getHeaders() }
    );
  }
}
