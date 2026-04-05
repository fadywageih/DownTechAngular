import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TokenService } from "../services/token.service";
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't add user token to admin or product endpoints - those are handled by AdminTokenInterceptor
    if (req.url.includes('/api/admin') || req.url.includes('/api/product')) {
      return next.handle(req);
    }
    
    const token = this.tokenService.getToken();
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}