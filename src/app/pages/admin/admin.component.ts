import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { TabsModule, Tab, TabList, TabPanel, TabPanels } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ContentManagerComponent } from './components/content-manager/content-manager.component';
import { ConfigPrecosComponent } from './components/config-precos/config-precos.component';
import { ConfigDisponibilidadeComponent } from './components/config-disponibilidade/config-disponibilidade.component';
import { ConfigCapacidadeComponent } from './components/config-capacidade/config-capacidade.component';
import { ReservaService, Reserva } from '../../core/services/reserva.service';
import { ReservationDetailsDialogComponent } from '../../shared/components/reservation-details-dialog/reservation-details-dialog.component';
import { CancelReservationDialogComponent } from '../../shared/components/cancel-reservation-dialog/cancel-reservation-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    AccordionModule,
    TooltipModule,
    ToastModule,
    ContentManagerComponent,
    ConfigPrecosComponent,
    ConfigDisponibilidadeComponent,
    ConfigCapacidadeComponent
  ],
  providers: [DialogService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  
  reservas: Reserva[] = [];
  isLoading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private reservaService: ReservaService,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.scrollToTop();
    this.carregarDados();
  }

  // Scroll para o topo da página
  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  carregarDados(): void {
    this.isLoading = true;
    
    this.reservaService.getAllReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Em caso de erro, manter array vazio
        this.reservas = [];
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMADA':
        return 'green';
      case 'PENDENTE_PAGAMENTO':
        return 'orange';
      case 'CANCELADA':
        return 'red';
      case 'FINALIZADA':
        return 'blue';
      case 'EM_ANDAMENTO':
        return 'purple';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'PENDENTE_PAGAMENTO':
        return 'Pendente';
      case 'CANCELADA':
        return 'Cancelada';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      default:
        return status;
    }
  }

  getStatusSeverity(status: string): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch (status) {
      case 'CONFIRMADA':
        return 'success';
      case 'PENDENTE_PAGAMENTO':
        return 'warn';
      case 'CANCELADA':
        return 'danger';
      case 'FINALIZADA':
        return 'info';
      case 'EM_ANDAMENTO':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getTipoText(tipo: string): string {
    switch (tipo) {
      case 'diaria':
        return 'Diária';
      case 'chale':
        return 'Chalé';
      case 'batismo':
        return 'Batismo';
      case 'completo':
        return 'Completo';
      default:
        return tipo;
    }
  }

  getTipoSeverity(tipo: string): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch (tipo) {
      case 'diaria':
        return 'info';
      case 'chale':
        return 'success';
      case 'batismo':
        return 'warn';
      case 'completo':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  viewDetails(reserva: Reserva): void {
    // TODO: Implementar modal ou navegação para detalhes
  }

  confirmBooking(reserva: Reserva): void {
    // TODO: Implementar confirmação de reserva
  }

  cancelBooking(reserva: Reserva): void {
    // TODO: Implementar cancelamento de reserva
  }

  /**
   * Visualizar detalhes completos da reserva
   */
  viewReservationDetails(reserva: Reserva): void {
    this.reservaService.getReservationDetails(reserva.id).subscribe({
      next: (detalhes) => {
        this.dialogService.open(ReservationDetailsDialogComponent, {
          data: { reserva: detalhes },
          width: '80vw',
          height: '90vh',
          header: `Detalhes da Reserva #${reserva.codigo}`,
          modal: true,
          closable: true,
          maximizable: true
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar detalhes da reserva'
        });
      }
    });
  }

  /**
   * Cancelar reserva
   */
  cancelReservation(reserva: Reserva): void {
    // Carregar detalhes completos da reserva antes de abrir o dialog
    this.reservaService.getReservationDetails(reserva.id).subscribe({
      next: (detalhes) => {
        (this.dialogService as any).open(CancelReservationDialogComponent, {
          data: { reserva: detalhes },
          width: '500px',
          header: `Cancelar Reserva ${reserva.codigo}`,
          modal: true,
          closable: true
        }).onClose.subscribe((result: any) => {
          if (result) {
            // Atualizar lista de reservas após cancelamento
            this.carregarDados();
            
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Reserva cancelada com sucesso!'
            });
          }
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar detalhes da reserva'
        });
      }
    });
  }
}