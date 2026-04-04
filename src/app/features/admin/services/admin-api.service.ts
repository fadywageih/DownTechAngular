import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AdminLoginDto, AdminAuthResultDto, AdminCreateDto, RefreshTokenDto, AdminResultDto } from "../../../core/models/admin.model";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly endpoints = {
    login: 'admin/login',
    register: 'admin/register',
    refreshToken: 'admin/refresh-token',
    admins: 'admin/admins',
    adminById: 'admin/admins',
    logout: 'admin/logout'
  };

  constructor(private apiService: ApiService) {}

  login(credentials: AdminLoginDto): Observable<AdminAuthResultDto> {
    return this.apiService.post<AdminAuthResultDto>(this.endpoints.login, credentials);
  }

  register(adminData: AdminCreateDto): Observable<AdminAuthResultDto> {
    return this.apiService.post<AdminAuthResultDto>(this.endpoints.register, adminData);
  }

  refreshToken(refreshToken: string): Observable<AdminAuthResultDto> {
    const payload: RefreshTokenDto = { refreshToken };
    return this.apiService.post<AdminAuthResultDto>(this.endpoints.refreshToken, payload);
  }

  getAllAdmins(): Observable<AdminResultDto[]> {
    return this.apiService.get<AdminResultDto[]>(this.endpoints.admins);
  }

  getAdminById(id: string): Observable<AdminResultDto> {
    return this.apiService.get<AdminResultDto>(`${this.endpoints.adminById}/${id}`);
  }

  logout(): Observable<any> {
    return this.apiService.post<any>(this.endpoints.logout, {});
  }
}

