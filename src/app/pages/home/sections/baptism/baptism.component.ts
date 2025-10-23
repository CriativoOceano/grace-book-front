import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';
import { ConteudoService, SimpleImage } from '../../../../core/services/conteudo.service';

@Component({
  selector: 'app-baptism',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './baptism.component.html',
  styleUrl: './baptism.component.scss'
})
export class BaptismComponent implements OnInit {
  @Output() bookingClick = new EventEmitter<void>();

  baptismImage: SimpleImage | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private conteudoService: ConteudoService
  ) {}

  ngOnInit(): void {
    this.carregarBaptismImage();
  }

  carregarBaptismImage(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.baptismImage = conteudo.baptismImage || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.baptismImage = this.conteudoService.getBaptismImage();
        this.isLoading = false;
      }
    });
  }

  goToBooking(): void {
    this.bookingClick.emit();
    this.router.navigate(['/booking']);
  }
}
