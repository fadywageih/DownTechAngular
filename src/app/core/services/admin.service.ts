  import { Injectable } from "@angular/core";
  import { Router } from "@angular/router";
  import { BehaviorSubject, Observable, tap } from "rxjs";
  import { AdminApiService } from "../../features/admin/services/admin-api.service";
  import { AdminLoginDto, AdminCreateDto, AdminAuthResultDto, AdminResultDto } from "../models/admin.model";
  import { TokenService } from "./token.service";
  @Injectable({
    providedIn: 'root'
  })
  export class AdminService {
    private currentAdminSubject = new BehaviorSubject<AdminAuthResultDto | null>(null);
    public currentAdmin$ = this.currentAdminSubject.asObservable();
    constructor(
      private adminApi: AdminApiService,
      private tokenService: TokenService,
      private router: Router
    ) {
      this.loadStoredAdmin();
    }
    private loadStoredAdmin(): void {
      const admin = this.tokenService.getAdminUser();
      const token = this.tokenService.getAdminToken();
      const isValid = this.tokenService.isAdminTokenValid();
      console.log('AdminService.loadStoredAdmin - admin:', admin?.email, 'token exists:', !!token, 'valid:', isValid);
      
      if (admin && isValid) {
        this.currentAdminSubject.next(admin);
        console.log('Admin loaded from storage:', admin.email);
      } else {
        if (token && !isValid) {
          console.warn('Admin token is invalid or expired');
        }
      }
    }
    login(credentials: AdminLoginDto): Observable<AdminAuthResultDto> {
      return this.adminApi.login(credentials).pipe(
        tap(response => this.handleAuthResponse(response))
      );
    }
    register(adminData: AdminCreateDto): Observable<AdminAuthResultDto> {
      return this.adminApi.register(adminData).pipe(
        tap(response => this.handleAuthResponse(response))
      );
    }
    refreshToken(refreshToken: string): Observable<AdminAuthResultDto> {
      return this.adminApi.refreshToken(refreshToken).pipe(
        tap(response => this.handleAuthResponse(response))
      );
    }
    logout(): void {
      this.tokenService.removeAdminToken();
      this.currentAdminSubject.next(null);
      this.router.navigate(['/admin/login']);
    }
    getAllAdmins(): Observable<AdminResultDto[]> {
      return this.adminApi.getAllAdmins();
    }
    getAdminById(id: string): Observable<AdminResultDto> {
      return this.adminApi.getAdminById(id);
    }
    private handleAuthResponse(response: AdminAuthResultDto): void {
      console.log('AdminService.handleAuthResponse - Setting token for:', response.email, 'role:', response.role);
      this.tokenService.setAdminToken(response.token);
      this.tokenService.setAdminUser(response);
      this.currentAdminSubject.next(response);
      console.log('Admin auth response handled, currentAdmin now:', this.currentAdminSubject.value?.email);
    }
    isAuthenticated(): boolean {
      return this.tokenService.isAdminTokenValid();
    }
    getCurrentAdmin(): AdminAuthResultDto | null {
      return this.currentAdminSubject.value;
    }
    hasSuperAdminRole(): boolean {
      const admin = this.getCurrentAdmin();
      return admin?.role === 'SuperAdmin';
    }
  }

