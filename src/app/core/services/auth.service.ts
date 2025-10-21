import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  nome: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CodigoAcessoRequest {
  identificador: string;
}

export interface LoginCodigoRequest {
  identificador: string;
  codigo: string;
}

export interface AdminLoginRequest {
  codigo: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private readonly TOKEN_KEY = 'grace_book_token';
  private readonly USER_KEY = 'grace_book_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const user = localStorage.getItem(this.USER_KEY);
      
      if (token && user) {
        try {
          // Verificar se o token não está expirado
          if (this.isTokenExpired(token)) {
            console.warn('🔒 Token expirado encontrado no localStorage. Limpando dados...');
            this.clearAuth();
            return;
          }
          
          const userObj = JSON.parse(user);
          this.currentUserSubject.next(userObj);
          this.isAuthenticatedSubject.next(true);
        } catch (error) {
          console.error('❌ Erro ao carregar dados de autenticação:', error);
          this.clearAuth();
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuth(response.access_token, response.user);
        })
      );
  }

  solicitarCodigoAcesso(identificador: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/solicitar-codigo`, { identificador });
  }

  loginComCodigo(credentials: LoginCodigoRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login-codigo`, credentials)
      .pipe(
        tap(response => {
          this.setAuth(response.access_token, response.user);
        })
      );
  }

  loginAdmin(codigo: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/admin-login`, { codigo })
      .pipe(
        tap(response => {
          this.setAuth(response.access_token, response.user);
        })
      );
  }

  private setAuth(token: string, user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/home']);
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Verificar se o token não está expirado
    if (this.isTokenExpired(token)) {
      console.warn('🔒 Token expirado detectado. Limpando autenticação...');
      this.clearAuth();
      return false;
    }
    
    return this.isAuthenticatedSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  /**
   * Verifica se o token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Decodificar o payload do JWT (sem verificar assinatura)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar se o token tem exp (expiration time)
      if (!payload.exp) {
        console.warn('⚠️ Token sem informação de expiração');
        return true; // Considerar expirado se não tiver exp
      }
      
      // Converter exp (timestamp em segundos) para milissegundos
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Adicionar margem de segurança de 5 minutos
      const margin = 5 * 60 * 1000; // 5 minutos em milissegundos
      
      const isExpired = currentTime >= (expirationTime - margin);
      
      if (isExpired) {
        console.warn('🔒 Token expirado:', {
          currentTime: new Date(currentTime).toISOString(),
          expirationTime: new Date(expirationTime).toISOString(),
          margin: '5 minutos'
        });
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do token:', error);
      return true; // Considerar expirado em caso de erro
    }
  }
}
