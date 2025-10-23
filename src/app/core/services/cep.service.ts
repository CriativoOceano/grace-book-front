import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface EnderecoCompleto {
  cep: string;
  endereco: string;
  numero?: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly viaCepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Busca informações de endereço pelo CEP
   * @param cep CEP no formato 00000-000 ou 00000000
   * @returns Observable com dados do endereço
   */
  buscarCep(cep: string): Observable<EnderecoCompleto> {
    // Limpar CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Validar formato do CEP
    if (cepLimpo.length !== 8) {
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }

    const url = `${this.viaCepUrl}/${cepLimpo}/json`;
    
    return this.http.get<CepResponse>(url).pipe(
      map(response => {
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }
        
        return this.mapearResposta(response);
      }),
      catchError(error => {
        return throwError(() => new Error('Erro ao buscar CEP. Verifique se o CEP está correto.'));
      })
    );
  }

  /**
   * Mapeia a resposta da API ViaCEP para o formato interno
   */
  private mapearResposta(response: CepResponse): EnderecoCompleto {
    return {
      cep: response.cep,
      endereco: response.logradouro,
      bairro: response.bairro,
      cidade: response.localidade,
      uf: response.uf,
      complemento: response.complemento || ''
    };
  }

  /**
   * Formata CEP para exibição (00000-000)
   */
  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Valida se o CEP está no formato correto
   */
  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }
}
