import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AdminService } from "../services/admin.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuth = this.adminService.isAuthenticated();
    const currentAdmin = this.adminService.getCurrentAdmin();
    console.log('AdminAuthGuard - isAuthenticated:', isAuth, 'currentAdmin:', currentAdmin?.email);
    
    if (isAuth) {
      return true;
    }
    
    console.log('Admin not authenticated, redirecting to login from:', state.url);
    this.router.navigate(['/admin/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

