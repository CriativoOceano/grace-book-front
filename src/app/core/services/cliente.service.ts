import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Cliente {
  id?: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  observacoes?: string;
  dataCadastro?: Date;
  ativo?: boolean;
  externalReference?: string; // Referência do ASAAS
}

export interface ClienteResponse {
  success: boolean;
  data?: Cliente | null;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly baseUrl = `${environment.apiUrl}/api/clientes`;

  constructor(private http: HttpClient) {}

  /**
   * Criar novo cliente/hóspede
   */
  createCliente(cliente: Cliente): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.baseUrl, cliente).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Buscar cliente por email
   */
  getClienteByEmail(email: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/email/${email}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Buscar cliente por ID
   */
  getClienteById(id: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Atualizar cliente existente
   */
  updateCliente(id: string, cliente: Partial<Cliente>): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.baseUrl}/${id}`, cliente).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Listar todos os clientes
   */
  getAllClientes(): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(this.baseUrl).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Verificar se cliente já existe por email
   */
  clienteExists(email: string): Observable<boolean> {
    return this.getClienteByEmail(email).pipe(
      map(response => response.success && response.data !== null),
      catchError(() => {
        // Se der erro, assumir que não existe
        return of(false);
      })
    );
  }

  /**
   * Criar ou atualizar cliente (upsert)
   */
  createOrUpdateCliente(cliente: Cliente): Observable<ClienteResponse> {
    return this.clienteExists(cliente.email).pipe(
      switchMap(exists => {
        if (exists) {
          // Cliente existe, atualizar
          return this.updateCliente(cliente.id!, cliente);
        } else {
          // Cliente não existe, criar novo
          return this.createCliente(cliente);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Salvar cliente com dados do hóspede do formulário
   */
  saveClienteFromBooking(bookingData: any): Observable<ClienteResponse> {
    const cliente: Cliente = {
      nome: bookingData.nomeHospede,
      sobrenome: bookingData.sobrenomeHospede,
      email: bookingData.emailHospede,
      telefone: bookingData.telefoneHospede,
      observacoes: bookingData.observacoesHospede || '',
      dataCadastro: new Date(),
      ativo: true
    };

    return this.createOrUpdateCliente(cliente);
  }

  /**
   * Tratamento de erros padronizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('Erro no ClienteService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
