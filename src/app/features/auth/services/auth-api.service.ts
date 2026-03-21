import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoginDto, UserResultDto, RegisterDto, ForgetPasswordDto, ResetPasswordRequestDto } from "../../../core/models/auth.model";
import { ApiService } from "../../../core/services/api.service";
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly endpoints = {
    login: 'Authentication/Login',
    register: 'Authentication/register',
    checkEmail: 'Authentication/emailexists',
    forgotPassword: 'Authentication/forgot-password',
    resetPassword: 'Authentication/reset-password'
  };

  constructor(private apiService: ApiService) {}
  login(credentials: LoginDto): Observable<UserResultDto> {
    return this.apiService.post<UserResultDto>(this.endpoints.login, credentials);
  }
  register(userData: RegisterDto): Observable<UserResultDto> {
    return this.apiService.post<UserResultDto>(this.endpoints.register, userData);
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.apiService.get<boolean>(this.endpoints.checkEmail, { email });
  }
  forgotPassword(email: string): Observable<{ message: string }> {
    const payload: ForgetPasswordDto = { email };
    return this.apiService.post<{ message: string }>(this.endpoints.forgotPassword, payload);
  }
resetPassword(resetData: ResetPasswordRequestDto): Observable<{ message: string }> {
  console.log('Calling resetPassword API with:', {
    email: resetData.email,
    token: resetData.token ? resetData.token.substring(0, 20) + '...' : null,
    password: '***',
    confirmPassword: '***'
  });
  return this.apiService.post<{ message: string }>(this.endpoints.resetPassword, resetData);
}
}