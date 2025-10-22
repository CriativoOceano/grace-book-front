import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { TagModule } from 'primeng/tag';

interface ReservaDetalhes {
  _id: string;
  codigo: string;
  codigoAcesso: string;
  usuario: {
    nome: string;
    email: string;
  };
  tipo: string;
  statusReserva: string;
  dataInicio: string;
  dataFim: string;
  quantidadePessoas: number;
  quantidadeChales: number;
  quantidadeDiarias: number;
  valorTotal: number;
  observacoes?: string;
  dadosHospede?: any;
  pagamento?: {
    status: string;
    linkPagamento?: string;
  };
}

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TagModule
  ],
  templateUrl: './consultar-reserva.component.html',
  styleUrl: './consultar-reserva.component.scss'
})
export class ConsultarReservaComponent implements OnInit {
  consultaForm: FormGroup;
  isLoading = false;
  reservaEncontrada: ReservaDetalhes | null = null;
  erroConsulta = '';
  mostrarResultado = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.consultaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.scrollToTop();
    
    // Converter código para maiúsculas automaticamente
    this.consultaForm.get('codigo')?.valueChanges.subscribe(value => {
      if (value) {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.consultaForm.get('codigo')?.setValue(upperValue, { emitEvent: false });
        }
      }
    });
  }

  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  consultarReserva(): void {
    if (this.consultaForm.valid) {
      this.isLoading = true;
      this.erroConsulta = '';
      this.reservaEncontrada = null;
      this.mostrarResultado = false;

      const { codigo, email } = this.consultaForm.value;

      this.bookingService.consultarReserva(codigo, email).subscribe({
        next: (reserva) => {
          this.reservaEncontrada = reserva;
          this.mostrarResultado = true;
          this.isLoading = false;
        },
        error: (error) => {
          this.erroConsulta = error.message || 'Erro ao consultar reserva. Verifique os dados e tente novamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.consultaForm.controls).forEach(key => {
      this.consultaForm.get(key)?.markAsTouched();
    });
  }

  novaConsulta(): void {
    this.consultaForm.reset();
    this.reservaEncontrada = null;
    this.erroConsulta = '';
    this.mostrarResultado = false;
    this.scrollToTop();
  }

  pagarReserva(): void {
    if (this.reservaEncontrada?.pagamento?.linkPagamento) {
      window.open(this.reservaEncontrada.pagamento.linkPagamento, '_blank');
    }
  }

  cancelarReserva(): void {
    // TODO: Implementar cancelamento de reserva
    console.log('Cancelar reserva:', this.reservaEncontrada?.codigo);
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
        return 'Pagamento pendente';
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

  getTipoDescricao(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'DIARIA': 'Diária',
      'CHALE': 'Chalé(s)',
      'BATISMO': 'Cerimônia de Batismo',
      'COMPLETO': 'Pacote Completo (Diária + Chalés)'
    };
    return tipos[tipo] || tipo;
  }

  getTipoText(tipo: string): string {
    switch (tipo) {
      case 'DIARIA':
        return 'Diária';
      case 'CHALE':
        return 'Chalé';
      case 'BATISMO':
        return 'Batismo';
      case 'COMPLETO':
        return 'Completo';
      default:
        return tipo;
    }
  }

  getTipoSeverity(tipo: string): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch (tipo) {
      case 'DIARIA':
        return 'info';
      case 'CHALE':
        return 'success';
      case 'BATISMO':
        return 'warn';
      case 'COMPLETO':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatusPagamentoText(status: string): string {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'PAGO':
        return 'Pago';
      case 'CANCELADO':
        return 'Cancelado';
      case 'VENCIDO':
        return 'Vencido';
      default:
        return status;
    }
  }

  getStatusPagamentoSeverity(status: string): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch (status) {
      case 'PENDENTE':
        return 'warn';
      case 'PAGO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      case 'VENCIDO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  podeCancelar(): boolean {
    return this.reservaEncontrada?.statusReserva === 'PENDENTE_PAGAMENTO';
  }

  podePagar(): boolean {
    return this.reservaEncontrada?.statusReserva === 'PENDENTE_PAGAMENTO' && 
           !!this.reservaEncontrada?.pagamento?.linkPagamento;
  }
}