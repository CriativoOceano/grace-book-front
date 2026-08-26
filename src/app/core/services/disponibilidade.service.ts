import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DisponibilidadeBloqueio, BloquearDataDto } from '../../models/configuracao.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadeService {
  private apiUrl = `${environment.apiUrl}/disponibilidade`;

  constructor(private http: HttpClient) {}

  getBloqueios(): Observable<DisponibilidadeBloqueio[]> {
    return this.http.get<DisponibilidadeBloqueio[]>(this.apiUrl);
  }

  // Pública — usada pelo calendário de reservas (sem login) pra desabilitar
  // visualmente os dias que o admin bloqueou.
  getBloqueiosPublico(): Observable<{ data: string }[]> {
    return this.http.get<{ data: string }[]>(`${this.apiUrl}/publico`);
  }

  bloquearData(bloqueio: BloquearDataDto): Observable<DisponibilidadeBloqueio> {
    return this.http.post<DisponibilidadeBloqueio>(`${this.apiUrl}/bloquear`, bloqueio);
  }

  desbloquearData(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}