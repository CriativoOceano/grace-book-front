import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DisponibilidadeService } from '../../../../core/services/disponibilidade.service';
import { DisponibilidadeBloqueio, BloquearDataDto } from '../../../../models/configuracao.model';

@Component({
  selector: 'app-config-disponibilidade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    CalendarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './config-disponibilidade.component.html',
  styleUrl: './config-disponibilidade.component.scss'
})
export class ConfigDisponibilidadeComponent implements OnInit {
  
  bloqueios: DisponibilidadeBloqueio[] = [];
  isLoading = false;
  isSaving = false;
  
  // Formulário para bloquear data
  novaDataBloqueio: string = '';
  novoMotivo: string = '';

  constructor(
    private disponibilidadeService: DisponibilidadeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarBloqueios();
  }

  carregarBloqueios(): void {
    this.isLoading = true;
    
    this.disponibilidadeService.getBloqueios().subscribe({
      next: (bloqueios: DisponibilidadeBloqueio[]) => {
        this.bloqueios = bloqueios;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar bloqueios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar bloqueios de disponibilidade'
        });
        this.isLoading = false;
      }
    });
  }

  bloquearData(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving = true;

    const bloqueio: BloquearDataDto = {
      data: this.novaDataBloqueio,
      motivo: this.novoMotivo
    };

    this.disponibilidadeService.bloquearData(bloqueio).subscribe({
      next: (bloqueio: DisponibilidadeBloqueio) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Data bloqueada com sucesso!'
        });
        this.carregarBloqueios();
        this.limparFormulario();
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Erro ao bloquear data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao bloquear data'
        });
        this.isSaving = false;
      }
    });
  }

  confirmarDesbloqueio(bloqueio: DisponibilidadeBloqueio): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja desbloquear a data ${bloqueio.data}?`,
      header: 'Confirmar Desbloqueio',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.desbloquearData(bloqueio.id!);
      }
    });
  }

  desbloquearData(id: string): void {
    this.disponibilidadeService.desbloquearData(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Data desbloqueada com sucesso!'
        });
        this.carregarBloqueios();
      },
      error: (error: any) => {
        console.error('Erro ao desbloquear data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao desbloquear data'
        });
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.novaDataBloqueio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Selecione uma data para bloquear'
      });
      return false;
    }

    if (!this.novoMotivo || this.novoMotivo.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Informe o motivo do bloqueio'
      });
      return false;
    }

    return true;
  }

  private limparFormulario(): void {
    this.novaDataBloqueio = '';
    this.novoMotivo = '';
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
