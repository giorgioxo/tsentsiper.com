import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    username: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  private logoutTimerId: any = null;

  constructor(private http: HttpClient) {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      if (this.isTokenExpired(savedToken)) {
        this.logout();
      } else {
        this.tokenSubject.next(savedToken);
        this.scheduleLogout(savedToken);
      }
    }
  }

  login(username: string, password: string): Observable<string | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      map(response => {
        if (response.success && response.token) {
          localStorage.setItem('auth_token', response.token);
          this.tokenSubject.next(response.token);
          this.scheduleLogout(response.token);
          return response.token;
        }
        return null;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  logout(): void {
    if (this.logoutTimerId) {
      clearTimeout(this.logoutTimerId);
      this.logoutTimerId = null;
    }
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.tokenSubject.value;
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private scheduleLogout(token: string) {
    const expMs = this.getTokenExpiry(token);
    if (!expMs) return;
    const delay = Math.max(0, expMs - Date.now());
    if (this.logoutTimerId) clearTimeout(this.logoutTimerId);
    this.logoutTimerId = setTimeout(() => this.logout(), delay);
  }

  private isTokenExpired(token: string): boolean {
    const exp = this.getTokenExpiry(token);
    if (!exp) return true;
    return Date.now() >= exp;
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      const exp = Number(payload?.exp);
      return Number.isFinite(exp) ? exp : null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(b64url: string): string {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
