import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ConfiguracaoService } from '../../../../core/services/configuracao.service';
import { Configuracao } from '../../../../models/configuracao.model';

@Component({
  selector: 'app-config-capacidade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './config-capacidade.component.html',
  styleUrl: './config-capacidade.component.scss'
})
export class ConfigCapacidadeComponent implements OnInit {
  
  configuracao: Configuracao | null = null;
  quantidadeMaximaChales: number = 4;
  diasAntecedenciaMinima: number = 2;
  qtdMaxPessoas: number = 200;
  
  isLoading = false;
  isSaving = false;

  constructor(
    private configuracaoService: ConfiguracaoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarConfiguracoes();
  }

  carregarConfiguracoes(): void {
    this.isLoading = true;
    
    this.configuracaoService.getConfiguracoes().subscribe({
      next: (config: Configuracao) => {
        this.configuracao = config;
        this.quantidadeMaximaChales = config.quantidadeMaximaChales || 4;
        this.diasAntecedenciaMinima = config.diasAntecedenciaMinima || 2;
        this.qtdMaxPessoas = config.qtdMaxPessoas || 200;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar configurações:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar configurações'
        });
        this.isLoading = false;
      }
    });
  }

  salvarCapacidade(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving = true;

    this.configuracaoService.updateConfiguracoes({
      quantidadeMaximaChales: this.quantidadeMaximaChales,
      diasAntecedenciaMinima: this.diasAntecedenciaMinima,
      qtdMaxPessoas: this.qtdMaxPessoas
    }).subscribe({
      next: (config: Configuracao) => {
        this.configuracao = config;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Configurações de capacidade atualizadas com sucesso!'
        });
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Erro ao salvar capacidade:', error);
        
        let errorMessage = 'Erro desconhecido ao salvar configurações';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
        } else if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (error.status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para alterar essas configurações.';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao Salvar',
          detail: errorMessage,
          life: 5000
        });
        this.isSaving = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.quantidadeMaximaChales || this.quantidadeMaximaChales <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Quantidade máxima de chalés deve ser maior que 0'
      });
      return false;
    }

    if (this.diasAntecedenciaMinima < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Dias de antecedência mínima deve ser maior ou igual a 0'
      });
      return false;
    }

    if (!this.qtdMaxPessoas || this.qtdMaxPessoas <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Quantidade máxima de pessoas deve ser maior que 0'
      });
      return false;
    }

    if (this.qtdMaxPessoas > 500) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Quantidade máxima de pessoas não pode ser maior que 500'
      });
      return false;
    }

    return true;
  }
}
