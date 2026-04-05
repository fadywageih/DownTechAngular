    // src/app/features/issue/issue.routes.ts
import { Routes } from '@angular/router';

export const ISSUE_ROUTES: Routes = [
  {
    path: 'report-issue',
    loadComponent: () => import('./components/report-issue/report-issue.component')
      .then(m => m.ReportIssueComponent)
  },
  {
    path: 'my-issues',
    loadComponent: () => import('./components/my-issues/my-issues.component')
      .then(m => m.MyIssuesComponent)
  },
  {
    path: '',
    redirectTo: 'report-issue',
    pathMatch: 'full'
  }
];