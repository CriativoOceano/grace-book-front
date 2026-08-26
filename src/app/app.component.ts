import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, User } from './core/services/auth.service';

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
export class AppComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isLoggedIn = false;
  user: User | null = null;
  currentYear = new Date().getFullYear();
  isMenuOpen = false;

  private subscriptions = new Subscription();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        this.isLoggedIn = isAuthenticated;
      })
    );
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.user = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout() {
    this.authService.logout();
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

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  navigateToAdmin() {
    this.scrollToTop();
    this.router.navigate(['/admin']);
  }
}