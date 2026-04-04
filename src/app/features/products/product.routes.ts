import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'laptops',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    data: { category: 'laptops' }
  },
  {
    path: 'pcs',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    data: { category: 'pcs' }
  },
  {
    path: 'accessories',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    data: { category: 'accessories' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/product-details/product-details.component')
      .then(m => m.ProductDetailsComponent)
  }
];