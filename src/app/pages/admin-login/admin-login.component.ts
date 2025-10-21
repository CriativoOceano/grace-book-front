import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar para admin
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const codigo = this.loginForm.get('codigo')?.value;

      this.authService.loginAdmin(codigo).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Login realizado com sucesso!' 
          });
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Extrair mensagem do backend
          let errorMessage = 'Código de acesso inválido';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 401) {
            errorMessage = 'Código de acesso inválido';
          } else if (error.status === 0) {
            errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
          }
          
          this.errorMessage = errorMessage;
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erro de Login', 
            detail: errorMessage 
          });
        }
      });
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}