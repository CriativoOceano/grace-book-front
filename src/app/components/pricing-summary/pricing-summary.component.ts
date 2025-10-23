import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';

export interface PricingBreakdown {
  tipoReserva: string;
  quantidadePessoas: number;
  quantidadeChales: number;
  quantidadeDias: number;
  valorDiaria: number;
  valorChales: number;
  valorBatismo: number;
  valorTotal: number;
  isLoading: boolean;
}

@Component({
  selector: 'app-pricing-summary',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, BadgeModule, SkeletonModule],
  templateUrl: './pricing-summary.component.html',
  styleUrl: './pricing-summary.component.scss'
})
export class PricingSummaryComponent implements OnInit, OnChanges {
  @Input() pricing: PricingBreakdown = {
    tipoReserva: '',
    quantidadePessoas: 0,
    quantidadeChales: 0,
    quantidadeDias: 0,
    valorDiaria: 0,
    valorChales: 0,
    valorBatismo: 0,
    valorTotal: 0,
    isLoading: true
  };

  @Input() precoChale: number = 150;
  @Input() showFinalizeButton: boolean = false;
  @Input() isProcessing: boolean = false;
  @Input() canFinalize: boolean = false;
  @Output() onFinalize = new EventEmitter<void>();

  ngOnInit() {
    // Componente inicializado
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pricing']) {
      // Atualizar quando os dados mudarem
    }
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'diaria': 'Diária',
      'batismo': 'Batismo',
      'CHALE': 'Hospedagem em Chalé'
    };
    return tipos[tipo] || tipo;
  }

  getPeriodoText(): string {
    if (this.pricing.quantidadeDias === 1) {
      return '1 dia';
    }
    return `${this.pricing.quantidadeDias} dias`;
  }

  getFaixaPessoas(): string {
    const pessoas = this.pricing.quantidadePessoas;
    if (pessoas <= 50) return 'até 50 pessoas';
    if (pessoas <= 100) return '51-100 pessoas';
    if (pessoas <= 150) return '101-150 pessoas';
    return '151-200 pessoas';
  }

  finalizarReserva(): void {
    if (this.canFinalize && !this.isProcessing) {
      this.onFinalize.emit();
    }
  }
}