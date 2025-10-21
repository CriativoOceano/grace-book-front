import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🔍 AuthGuard: Verificando autenticação...');
    
    // Verificar se está autenticado (inclui verificação de token expirado)
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      console.log('✅ AuthGuard: Usuário autenticado:', user?.email);
      return true;
    }
    
    console.warn('❌ AuthGuard: Usuário não autenticado. Redirecionando para login...');
    this.router.navigate(['/admin-login']);
    return false;
  }
}
