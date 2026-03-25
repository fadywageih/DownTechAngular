import { Injectable } from "@angular/core";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ADMIN_TOKEN_KEY = 'admin_token';
  private readonly USER_KEY = 'user_data';
  private readonly ADMIN_KEY = 'admin_data';
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  setAdminToken(token: string): void {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
  }
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
  removeAdminToken(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
  }
  setAdminUser(user: any): void {
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(user));
  }
  getAdminUser(): any {
    const user = localStorage.getItem(this.ADMIN_KEY);
    return user ? JSON.parse(user) : null;
  }
  isAdminTokenValid(): boolean {
    const token = this.getAdminToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }
}