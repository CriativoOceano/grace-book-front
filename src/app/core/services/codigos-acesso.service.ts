import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CodigoAcesso {
  _id: string;
  nome: string;
  ativo: boolean;
  criadoPorNome?: string;
  ultimoUso?: string;
  revogadoEm?: string;
  revogadoPorNome?: string;
  createdAt: string;
}

export interface CodigoAcessoGerado {
  id: string;
  nome: string;
  codigo: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodigosAcessoService {
  private apiUrl = `${environment.apiUrl}/codigos-acesso`;

  constructor(private http: HttpClient) {}

  listar(): Observable<CodigoAcesso[]> {
    return this.http.get<CodigoAcesso[]>(this.apiUrl);
  }

  criar(nome: string): Observable<CodigoAcessoGerado> {
    return this.http.post<CodigoAcessoGerado>(this.apiUrl, { nome });
  }

  revogar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
