import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracao, UpdateConfiguracaoDto } from '../../models/configuracao.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {
  private apiUrl = `${environment.apiUrl}/configuracoes`;

  constructor(private http: HttpClient) {}

  getConfiguracoes(): Observable<Configuracao> {
    return this.http.get<Configuracao>(this.apiUrl);
  }

  updateConfiguracoes(configuracao: UpdateConfiguracaoDto): Observable<Configuracao> {
    return this.http.patch<Configuracao>(this.apiUrl, configuracao);
  }

  updateCapacidade(capacidadeMaxima: number): Observable<Configuracao> {
    return this.http.put<Configuracao>(`${this.apiUrl}/capacidade`, { capacidadeMaxima });
  }

  updateQuantidadeMaximaChales(quantidadeMaximaChales: number): Observable<Configuracao> {
    return this.http.put<Configuracao>(`${this.apiUrl}/quantidade-maxima-chales`, { quantidadeMaximaChales });
  }

  updateDiasAntecedenciaMinima(diasAntecedenciaMinima: number): Observable<Configuracao> {
    return this.http.put<Configuracao>(`${this.apiUrl}/dias-antecedencia-minima`, { diasAntecedenciaMinima });
  }
}