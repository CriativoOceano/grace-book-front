import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'reservar', 
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) 
  },
  { 
    path: 'payment-success', 
    loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) 
  },
  // Páginas temporariamente desabilitadas devido ao NG-ZORRO
  // { 
  //   path: 'login', 
  //   loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) 
  // },
  // { 
  //   path: 'admin', 
  //   loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
  //   canActivate: [() => import('./core/guards/auth.guard').then(m => m.AuthGuard)]
  // },
  // { 
  //   path: 'minhas-reservas', 
  //   loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  //   canActivate: [() => import('./core/guards/auth.guard').then(m => m.AuthGuard)]
  // },
  { path: '**', redirectTo: '/home' }
];