import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { AdminAuthGuard } from "./core/guards/admin-auth.guard";
import { RoleGuard } from "./core/guards/role.guard";
import { AdminTokenInterceptor } from "./core/interceptors/admin-token.interceptor";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AdminTokenInterceptor,
      multi: true
    },
    AdminAuthGuard,
    RoleGuard
  ]
};