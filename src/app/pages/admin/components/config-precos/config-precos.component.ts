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
import { FaixaPreco, Configuracao } from '../../../../models/configuracao.model';

@Component({
  selector: 'app-config-precos',
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
  templateUrl: './config-precos.component.html',
  styleUrl: './config-precos.component.scss'
})
export class ConfigPrecosComponent implements OnInit {
  
  configuracao: Configuracao | null = null;
  faixasPreco: FaixaPreco[] = [];
  precoChale: number = 0;
  precoBatismo: number = 0;
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
        this.faixasPreco = [...config.precoDiaria];
        this.precoChale = config.precoChale;
        this.precoBatismo = config.precoBatismo;
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

  salvarPrecos(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving = true;

    this.configuracaoService.updateConfiguracoes({
      precoDiaria: this.faixasPreco,
      precoChale: this.precoChale,
      precoBatismo: this.precoBatismo
    }).subscribe({
      next: (config: Configuracao) => {
        this.configuracao = config;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Preços atualizados com sucesso!'
        });
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Erro ao salvar preços:', error);
        
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
    // Validar faixas de preço
    for (let i = 0; i < this.faixasPreco.length; i++) {
      const faixa = this.faixasPreco[i];
      
      if (!faixa.maxPessoas || faixa.maxPessoas <= 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validação',
          detail: `Faixa ${i + 1}: Quantidade máxima de pessoas deve ser maior que 0`
        });
        return false;
      }

      if (!faixa.valor || faixa.valor <= 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validação',
          detail: `Faixa ${i + 1}: Valor deve ser maior que 0`
        });
        return false;
      }
    }

    // Validar preço do chalé
    if (!this.precoChale || this.precoChale <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Preço do chalé deve ser maior que 0'
      });
      return false;
    }

    // Validar preço do batismo
    if (!this.precoBatismo || this.precoBatismo <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Preço do batismo deve ser maior que 0'
      });
      return false;
    }

    return true;
  }

  getFaixaLabel(index: number): string {
    const faixas = [
      '1 a 30 pessoas',
      '31 a 60 pessoas', 
      '61 a 100 pessoas',
      '101 a 200 pessoas'
    ];
    return faixas[index] || `Faixa ${index + 1}`;
  }
}
