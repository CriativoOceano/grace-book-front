import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  expiresAt: number;
  user: User;
}

// O que fica salvo localmente: só o perfil (pra render otimista do
// cabeçalho/guard) e o instante de expiração devolvido pelo backend. Nunca
// o JWT em si — esse vive só no cookie httpOnly, fora do alcance de JS.
interface StoredSession {
  user: User;
  expiresAt: number;
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
  private readonly API_URL = environment.apiUrl;
  // Guarda só perfil + expiração (nada sensível) — o JWT em si vive num
  // cookie httpOnly que o próprio navegador administra e este código nunca
  // enxerga, para não ficar exposto a um XSS.
  private readonly SESSION_KEY = 'grace_book_session';
  private readonly EXPIRY_MARGIN_MS = 5 * 60 * 1000;

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
    if (typeof window === 'undefined' || !window.localStorage) return;

    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return;

    try {
      const session: StoredSession = JSON.parse(raw);
      if (!session.expiresAt || this.isExpired(session.expiresAt)) {
        this.clearAuth();
        return;
      }
      this.currentUserSubject.next(session.user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      this.clearAuth();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuth(response.user, response.expiresAt);
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
          this.setAuth(response.user, response.expiresAt);
        })
      );
  }

  loginAdmin(codigo: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/admin-login`, { codigo })
      .pipe(
        tap(response => {
          this.setAuth(response.user, response.expiresAt);
        })
      );
  }

  private setAuth(user: User, expiresAt: number): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const session: StoredSession = { user, expiresAt };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    // Best-effort: limpa o cookie httpOnly no backend. Mesmo se essa
    // chamada falhar (rede fora, já expirado etc.), o estado local abaixo
    // já desloga a UI de qualquer forma.
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
      error: () => {},
    });
    this.clearAuth();
    this.router.navigate(['/home']);
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.SESSION_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    // Isto é só o estado otimista da UI (mostrar/esconder o menu de admin,
    // liberar a rota) — quem decide de verdade se uma ação é permitida é o
    // backend, validando o cookie httpOnly a cada chamada. Se a sessão
    // guardada expirou localmente, ou o cookie já não é mais válido no
    // servidor, o próximo request autenticado volta 401 e o
    // errorInterceptor desloga e redireciona.
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.isAuthenticatedSubject.value;
    }
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return false;

    try {
      const session: StoredSession = JSON.parse(raw);
      if (!session.expiresAt || this.isExpired(session.expiresAt)) {
        this.clearAuth();
        return false;
      }
      return this.isAuthenticatedSubject.value;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  private isExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt - this.EXPIRY_MARGIN_MS;
  }
}
