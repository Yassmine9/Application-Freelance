import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user: any;
  status: string;
}

export interface RegisterResponse {
  message: string;
  status: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private currentUser$ = new BehaviorSubject<any>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  // ─── LOGIN ──────────────────────────────────────────────────────

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser$.next(res.user);
      })
    );
  }

  // ─── REGISTER CLIENT ───────────────────────────────────────────

  registerClient(data: {
    email: string;
    password: string;
    name: string;
    company_name?: string;
    phone?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, {
      ...data,
      role: 'client'
    });
  }

  // ─── REGISTER FREELANCER ───────────────────────────────────────

  registerFreelancer(data: {
    email: string;
    password: string;
    name: string;
    skills?: string[];
    hourly_rate?: number;
    bio?: string;
    phone?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, {
      ...data,
      role: 'freelancer'
    });
  }

  // ─── PROFILE ───────────────────────────────────────────────────

  getProfile(): Observable<{ user: any }> {
    return this.http.get<{ user: any }>(`${this.apiUrl}/freelancer/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── TOKEN & SESSION ──────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredUser(): any {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  isFreelancer(): boolean {
    const user = this.getStoredUser();
    return user && user.role === 'freelancer';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser$.next(null);
  }

  // ─── HELPERS ──────────────────────────────────────────────────

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
