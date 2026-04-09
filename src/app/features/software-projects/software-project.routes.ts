import { Routes } from '@angular/router';

export const SOFTWARE_PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/software-project-list/software-project-list.component')
      .then(m => m.SoftwareProjectListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/software-project-details/software-project-details.component')
      .then(m => m.SoftwareProjectDetailsComponent)
  }
];