import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollAnimationDirective } from '../../../../shared/directives/scroll-animation.directive';
import { ConteudoService, SimpleImage } from '../../../../core/services/conteudo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  @Output() bookingClick = new EventEmitter<void>();

  aboutImage: SimpleImage | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private conteudoService: ConteudoService
  ) {}

  ngOnInit(): void {
    this.carregarAboutImage();
  }

  carregarAboutImage(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.aboutImage = conteudo.aboutImage || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.aboutImage = this.conteudoService.getAboutImage();
        this.isLoading = false;
      }
    });
  }

  goToBooking(): void {
    this.bookingClick.emit();
    this.router.navigate(['/booking']);
  }
}
