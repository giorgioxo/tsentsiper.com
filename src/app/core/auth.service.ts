import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  // Mock credentials
  private readonly MOCK_USERNAME = 'Admin';
  private readonly MOCK_PASSWORD = 'TsAdmin123';

  constructor() {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.tokenSubject.next(savedToken);
    }
  }

  login(username: string, password: string): Observable<string | null> {
    // Mock authentication - in real app this would call backend API
    if (username === this.MOCK_USERNAME && password === this.MOCK_PASSWORD) {
      const token = this.generateMockToken();
      localStorage.setItem('auth_token', token);
      this.tokenSubject.next(token);
      return of(token);
    } else {
      return of(null);
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.tokenSubject.value !== null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private generateMockToken(): string {
    // Generate a mock JWT-like token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: 'admin', 
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa('mock-signature-' + Date.now());
    
    return `${header}.${payload}.${signature}`;
  }
}
