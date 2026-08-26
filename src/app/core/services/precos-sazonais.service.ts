import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PrecoSazonal {
  _id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  tipoAjuste: 'percentual' | 'fixo';
  valorAjuste: number;
  ativo: boolean;
  criadoPorNome?: string;
  createdAt: string;
}

export interface CriarPrecoSazonal {
  nome: string;
  dataInicio: string;
  dataFim: string;
  tipoAjuste: 'percentual' | 'fixo';
  valorAjuste: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrecosSazonaisService {
  private apiUrl = `${environment.apiUrl}/precos-sazonais`;

  constructor(private http: HttpClient) {}

  listar(): Observable<PrecoSazonal[]> {
    return this.http.get<PrecoSazonal[]>(this.apiUrl);
  }

  criar(dto: CriarPrecoSazonal): Observable<PrecoSazonal> {
    return this.http.post<PrecoSazonal>(this.apiUrl, dto);
  }

  atualizar(id: string, dto: Partial<CriarPrecoSazonal & { ativo: boolean }>): Observable<PrecoSazonal> {
    return this.http.patch<PrecoSazonal>(`${this.apiUrl}/${id}`, dto);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
