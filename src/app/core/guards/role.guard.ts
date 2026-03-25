import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AdminService } from "../services/admin.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRole = route.data['role'];
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    if (requiredRole === 'SuperAdmin') {
      const currentAdmin = this.adminService.getCurrentAdmin();
      const hasSuperAdminRole = currentAdmin?.role === 'SuperAdmin';
      
      if (!hasSuperAdminRole) {
        this.router.navigate(['/admin/dashboard']);
        return false;
      }
    }
    
    return true;
  }
}