import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratar erro 401 (Unauthorized) - Token expirado ou inválido
      if (error.status === 401) {
        console.warn('🔒 Token expirado ou inválido. Redirecionando para login...');
        
        // Limpar dados de autenticação
        authService.logout();
        
        // Redirecionar para login admin se estiver tentando acessar área admin
        if (req.url.includes('/admin') || req.url.includes('/configuracoes') || req.url.includes('/reservas')) {
          router.navigate(['/admin-login']);
        } else {
          router.navigate(['/login']);
        }
        
        return throwError(() => new Error('Token expirado. Faça login novamente.'));
      }
      
      // Tratar erro 403 (Forbidden) - Acesso negado
      if (error.status === 403) {
        console.warn('🚫 Acesso negado. Redirecionando...');
        router.navigate(['/admin-login']);
        return throwError(() => new Error('Acesso negado.'));
      }
      
      // Repassar outros erros
      return throwError(() => error);
    })
  );
};
