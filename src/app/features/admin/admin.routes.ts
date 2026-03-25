import { Routes } from '@angular/router';
import { AdminAuthGuard } from '../../core/guards/admin-auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/admin-register/admin-register.component').then(m => m.AdminRegisterComponent),
    canActivate: [AdminAuthGuard, RoleGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: '',
    loadComponent: () => import('./components/admin-main/admin-main.component').then(m => m.AdminMainComponent),
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: 'admins',
        loadComponent: () => import('./components/admin-admins-list/admin-admins-list.component').then(m => m.AdminAdminsListComponent),
        canActivate: [RoleGuard],
        data: { role: 'SuperAdmin' }
      },
      {
        path: 'admins/:id',
        loadComponent: () => import('./components/admin-detail/admin-detail.component').then(m => m.AdminDetailComponent),
        canActivate: [RoleGuard],
        data: { role: 'SuperAdmin' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

