import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  CodigosAcessoService,
  CodigoAcesso,
  CodigoAcessoGerado,
} from '../../../../core/services/codigos-acesso.service';

@Component({
  selector: 'app-codigos-acesso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './codigos-acesso.component.html',
  styleUrl: './codigos-acesso.component.scss',
})
export class CodigosAcessoComponent implements OnInit {
  codigos: CodigoAcesso[] = [];
  isLoading = false;
  isSalvando = false;

  mostrarDialogCriar = false;
  nomeNovoCodigo = '';

  // Preenchido só depois de gerar um código novo — é a única vez que o
  // valor em texto puro existe no front. Fechar o dialog descarta.
  codigoGerado: CodigoAcessoGerado | null = null;

  constructor(
    private codigosAcessoService: CodigosAcessoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarCodigos();
  }

  carregarCodigos(): void {
    this.isLoading = true;
    this.codigosAcessoService.listar().subscribe({
      next: (codigos) => {
        this.codigos = codigos;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os códigos de acesso.',
        });
      },
    });
  }

  abrirDialogCriar(): void {
    this.nomeNovoCodigo = '';
    this.codigoGerado = null;
    this.mostrarDialogCriar = true;
  }

  gerarCodigo(): void {
    const nome = this.nomeNovoCodigo.trim();
    if (!nome) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome obrigatório',
        detail: 'Informe o nome de quem vai usar este código.',
      });
      return;
    }

    this.isSalvando = true;
    this.codigosAcessoService.criar(nome).subscribe({
      next: (resultado) => {
        this.isSalvando = false;
        this.codigoGerado = resultado;
        this.carregarCodigos();
      },
      error: (error) => {
        this.isSalvando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível gerar o código.',
        });
      },
    });
  }

  fecharDialog(): void {
    this.mostrarDialogCriar = false;
    this.codigoGerado = null;
    this.nomeNovoCodigo = '';
  }

  confirmarRevogar(codigo: CodigoAcesso): void {
    this.confirmationService.confirm({
      message: `Revogar o código de "${codigo.nome}"? A pessoa não vai mais conseguir acessar o painel com ele, e isso não pode ser desfeito.`,
      header: 'Revogar código de acesso',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, revogar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.revogar(codigo),
    });
  }

  private revogar(codigo: CodigoAcesso): void {
    this.codigosAcessoService.revogar(codigo._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Código revogado',
          detail: `O código de "${codigo.nome}" foi revogado.`,
        });
        this.carregarCodigos();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            error.error?.message || 'Não foi possível revogar este código.',
          life: 6000,
        });
      },
    });
  }
}
