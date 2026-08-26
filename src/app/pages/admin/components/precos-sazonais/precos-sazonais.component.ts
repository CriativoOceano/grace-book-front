import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  PrecosSazonaisService,
  PrecoSazonal,
} from '../../../../core/services/precos-sazonais.service';

@Component({
  selector: 'app-precos-sazonais',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './precos-sazonais.component.html',
  styleUrl: './precos-sazonais.component.scss',
})
export class PrecosSazonaisComponent implements OnInit {
  regras: PrecoSazonal[] = [];
  isLoading = false;
  isSalvando = false;

  mostrarDialog = false;
  minDate: Date = new Date();

  opcoesTipoAjuste = [
    { label: 'Porcentagem (%)', value: 'percentual' },
    { label: 'Valor fixo (R$)', value: 'fixo' },
  ];

  form: {
    nome: string;
    dataInicio: Date | null;
    dataFim: Date | null;
    tipoAjuste: 'percentual' | 'fixo';
    valorAjuste: number | null;
  } = this.formVazio();

  constructor(
    private precosSazonaisService: PrecosSazonaisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private formVazio() {
    return {
      nome: '',
      dataInicio: null,
      dataFim: null,
      tipoAjuste: 'percentual' as const,
      valorAjuste: null,
    };
  }

  carregar(): void {
    this.isLoading = true;
    this.precosSazonaisService.listar().subscribe({
      next: (regras) => {
        this.regras = regras;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os preços sazonais.',
        });
      },
    });
  }

  abrirDialogNovo(): void {
    this.form = this.formVazio();
    this.mostrarDialog = true;
  }

  fecharDialog(): void {
    this.mostrarDialog = false;
  }

  salvar(): void {
    if (
      !this.form.nome.trim() ||
      !this.form.dataInicio ||
      !this.form.dataFim ||
      this.form.valorAjuste === null ||
      this.form.valorAjuste === undefined
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Preencha nome, período e o valor do ajuste.',
      });
      return;
    }

    if (this.form.dataInicio > this.form.dataFim) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Período inválido',
        detail: 'A data de início não pode ser depois da data de fim.',
      });
      return;
    }

    this.isSalvando = true;
    this.precosSazonaisService
      .criar({
        nome: this.form.nome.trim(),
        dataInicio: this.form.dataInicio.toISOString(),
        dataFim: this.form.dataFim.toISOString(),
        tipoAjuste: this.form.tipoAjuste,
        valorAjuste: this.form.valorAjuste,
      })
      .subscribe({
        next: () => {
          this.isSalvando = false;
          this.mostrarDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Preço sazonal criado com sucesso!',
          });
          this.carregar();
        },
        error: (error) => {
          this.isSalvando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível salvar.',
          });
        },
      });
  }

  alternarAtivo(regra: PrecoSazonal): void {
    this.precosSazonaisService
      .atualizar(regra._id, { ativo: !regra.ativo })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: regra.ativo ? 'Regra desativada' : 'Regra ativada',
            detail: `"${regra.nome}" foi ${regra.ativo ? 'desativada' : 'ativada'}.`,
          });
          this.carregar();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar esta regra.',
          });
        },
      });
  }

  confirmarRemover(regra: PrecoSazonal): void {
    this.confirmationService.confirm({
      message: `Remover a regra de preço "${regra.nome}"? Isso não pode ser desfeito.`,
      header: 'Remover preço sazonal',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.remover(regra),
    });
  }

  private remover(regra: PrecoSazonal): void {
    this.precosSazonaisService.remover(regra._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Removido',
          detail: `A regra "${regra.nome}" foi removida.`,
        });
        this.carregar();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível remover esta regra.',
        });
      },
    });
  }

  descricaoAjuste(regra: PrecoSazonal): string {
    if (regra.tipoAjuste === 'percentual') {
      return `${regra.valorAjuste > 0 ? '+' : ''}${regra.valorAjuste}%`;
    }
    return `${regra.valorAjuste > 0 ? '+' : ''}R$ ${regra.valorAjuste.toFixed(2)}`;
  }
}
