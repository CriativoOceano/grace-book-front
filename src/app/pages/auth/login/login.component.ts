import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  
  loginForm!: FormGroup;
  codigoForm!: FormGroup;
  isLoading = false;
  codigoEnviado = false;
  activeTab = 'login';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    // Formulário de login tradicional
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Formulário de login com código
    this.codigoForm = this.fb.group({
      identificador: ['', [Validators.required]],
      codigo: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Login tradicional
  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Mock temporário - será substituído pela integração real
      setTimeout(() => {
        alert('Login realizado com sucesso!');
        this.router.navigate(['/minhas-reservas']);
        this.isLoading = false;
      }, 1000);
    } else {
      alert('Preencha todos os campos obrigatórios');
    }
  }

  // Solicitar código de acesso
  solicitarCodigo(): void {
    if (this.codigoForm.get('identificador')?.valid) {
      this.isLoading = true;
      
      // Mock temporário - será substituído pela integração real
      setTimeout(() => {
        this.codigoEnviado = true;
        alert('Código enviado para seu email!');
        this.isLoading = false;
      }, 1000);
    } else {
      this.codigoForm.get('identificador')?.markAsTouched();
    }
  }

  // Login com código
  onLoginCodigo(): void {
    if (this.codigoForm.valid) {
      this.isLoading = true;
      
      // Mock temporário - será substituído pela integração real
      setTimeout(() => {
        alert('Login realizado com sucesso!');
        this.router.navigate(['/minhas-reservas']);
        this.isLoading = false;
      }, 1000);
    } else {
      alert('Preencha todos os campos obrigatórios');
    }
  }

  // Voltar para solicitar novo código
  voltarSolicitacao(): void {
    this.codigoEnviado = false;
    this.codigoForm.get('codigo')?.setValue('');
  }
}