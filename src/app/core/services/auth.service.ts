import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthApiService } from "../../features/auth/services/auth-api.service";
import { UserResultDto, LoginDto, RegisterDto } from "../models/auth.model";
import { TokenService } from "./token.service";
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserResultDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  constructor(
    private authApi: AuthApiService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loadStoredUser();
  }
  private loadStoredUser(): void {
    const user = this.tokenService.getUser();
    if (user && this.tokenService.isTokenValid()) {
      this.currentUserSubject.next(user);
    }
  }
  login(credentials: LoginDto): Observable<UserResultDto> {
    return this.authApi.login(credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }
  register(userData: RegisterDto): Observable<UserResultDto> {
    return this.authApi.register(userData).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }
  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  private handleAuthResponse(response: UserResultDto): void {
    this.tokenService.setToken(response.token);
    this.tokenService.setUser(response);
    this.currentUserSubject.next(response);
  }
  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }
  getCurrentUser(): UserResultDto | null {
    return this.currentUserSubject.value;
  }
}