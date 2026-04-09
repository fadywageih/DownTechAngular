import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';

@Injectable()
export class AdminTokenInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
if (request.url.includes('/api/admin') || 
      (request.url.includes('/api/product') && (
        request.method !== 'GET' || 
        request.url.includes('/create') || 
        request.url.includes('update') || 
        request.url.includes('delete') ||
        request.url.includes('/edit/')
      )) ||
      (request.url.includes('/api/issue') && !request.url.includes('user')) ||
      request.url.includes('/api/softwareproject')) {
      const adminToken = this.tokenService.getAdminToken();
      
      if (adminToken) {
        request = request.clone({
          headers: request.headers.delete('Authorization').set('Authorization', `Bearer ${adminToken}`)
        });
      } else {
        console.warn('AdminTokenInterceptor: No admin token found for', request.url);
      }
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
if (request.url.includes('/api/admin') && (error.status === 401 || error.status === 403)) {
          this.tokenService.removeAdminToken();
          this.router.navigate(['/admin/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
