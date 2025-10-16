import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
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

  constructor() {
    // Mock temporário - será substituído quando o AuthService estiver pronto
    this.isLoggedIn = false;
    this.user = null;
  }

  logout() {
    this.isLoggedIn = false;
    this.user = null;
  }
}