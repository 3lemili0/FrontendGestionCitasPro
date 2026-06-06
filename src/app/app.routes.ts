import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro-selector/registro-selector'),
  },
  {
    path: 'registro/cliente',
    loadComponent: () => import('./pages/registro-cliente/registro-cliente'),
  },
  {
    path: 'registro/profesional',
    loadComponent: () => import('./pages/registro-profesional/registro-profesional'),
  },

  // --- RUTAS PROTEGIDAS ---
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard'),
    canActivate: [authGuard]
  },
  {
    path: 'solicitar-cita',
    loadComponent: () => import('./pages/solicitar-cita/solicitar-cita'),
    canActivate: [authGuard]
  },
  {
    path: 'gestionar-disponibilidad',
    loadComponent: () => import('./pages/gestionar-disponibilidad/gestionar-disponibilidad'),
    canActivate: [authGuard] 
  },

  // --- REDIRECCIONES (SIEMPRE DEBEN IR AL FINAL) ---
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**', // El comodín "atrapa-todo"
    redirectTo: 'dashboard'
  }
];