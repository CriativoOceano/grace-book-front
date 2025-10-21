import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isCollapsed = false;
  isLoggedIn = false;
  user: any = null;
  logoPath = 'https://via.placeholder.com/40x40/4E944F/FFFFFF?text=SC';
  currentYear = new Date().getFullYear();
  isMenuOpen = false;

  constructor(private router: Router) {
    // Mock temporário - será substituído quando o AuthService estiver pronto
    this.isLoggedIn = false;
    this.user = null;
  }

  logout() {
    this.isLoggedIn = false;
    this.user = null;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    // Fechar o menu mobile
    this.closeMenu();
    
    // Se estiver na página home, fazer scroll para a seção
    if (this.router.url === '/home' || this.router.url === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // Se não estiver na home, navegar para home e depois fazer scroll
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      });
    }
  }
}