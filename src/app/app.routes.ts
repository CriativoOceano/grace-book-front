import { Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'booking', 
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) 
  },
  { 
    path: 'reservar', 
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) 
  },
  { 
    path: 'consultar-reserva', 
    loadComponent: () => import('./pages/consultar-reserva/consultar-reserva.component').then(m => m.ConsultarReservaComponent) 
  },
  { 
    path: 'payment-success', 
    loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) 
  },
  { 
    path: 'admin-login', 
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  // { 
  //   path: 'minhas-reservas', 
  //   loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  //   canActivate: [() => import('./core/guards/auth.guard').then(m => m.AuthGuard)]
  // },
  { path: '**', redirectTo: '' }
];

export const preloadingStrategy = PreloadAllModules;