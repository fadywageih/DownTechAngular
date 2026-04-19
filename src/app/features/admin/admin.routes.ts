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
        path: 'products',
        loadComponent: () => import('./components/admin-products/admin-products-list/admin-products-list.component')
          .then(m => m.AdminProductsListComponent)
      },
      {
        path: 'products/create',
        loadComponent: () => import('./components/admin-products/admin-product-form/admin-product-form.component')
          .then(m => m.AdminProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./components/admin-products/admin-product-form/admin-product-form.component')
          .then(m => m.AdminProductFormComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./components/admin-products/admin-product-detail/admin-product-detail.component')
          .then(m => m.AdminProductDetailComponent)
      },
      {
        path: 'issues',
        loadComponent: () => import('./components/admin-issues/admin-issues-list.component')
          .then(m => m.AdminIssuesListComponent)
      },
      {
        path: 'issues/:id',
        loadComponent: () => import('./components/admin-issue-detail/admin-issue-detail.component')
          .then(m => m.AdminIssueDetailComponent)
      },
      // ✅ Software Projects Routes
      {
        path: 'software-projects',
        loadComponent: () => import('./components/admin-software-projects/admin-software-projects-list/admin-software-projects-list.component')
          .then(m => m.AdminSoftwareProjectsListComponent)
      },
      {
        path: 'software-projects/create',
        loadComponent: () => import('./components/admin-software-projects/admin-software-project-form/admin-software-project-form.component')
          .then(m => m.AdminSoftwareProjectFormComponent)
      },
      {
        path: 'software-projects/edit/:id',
        loadComponent: () => import('./components/admin-software-projects/admin-software-project-form/admin-software-project-form.component')
          .then(m => m.AdminSoftwareProjectFormComponent)
      },
      {
        path: 'software-projects/:id',
        loadComponent: () => import('./components/admin-software-projects/admin-software-project-detail/admin-software-project-detail.component')
          .then(m => m.AdminSoftwareProjectDetailComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/admin-orders-list/admin-orders-list.component').then(m => m.AdminOrdersListComponent)
      },
      {
        path: '',
        redirectTo: 'products',
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