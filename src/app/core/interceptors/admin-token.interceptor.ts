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
    if (request.url.includes('/api/admin')) {
      const token = this.tokenService.getAdminToken();
      
      if (token) {
        request = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
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