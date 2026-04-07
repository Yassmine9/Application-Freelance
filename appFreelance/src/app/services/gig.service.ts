import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GigService {

  private base = environment.apiUrl;

 constructor(private http: HttpClient) {}
   private headers() {
    const token =localStorage.getItem('auth_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ── Public endpoints (no token needed) ──────────────────

  getAllGigs(): Observable<any> {
    return this.http.get(`${this.base}/gigs`);
  }

  getGigDetails(gigId: string): Observable<any> {
    return this.http.get(`${this.base}/gigs/${gigId}`);
  }

  searchGigs(query: string): Observable<any> {
    return this.http.get(`${this.base}/gigs/search`, {
      params: { query }   // → /gigs/search?query=flask
    });
  }

  // ── Freelancer endpoints (token added by interceptor) ───

  getMyGigs(): Observable<any> {
    return this.http.get(`${this.base}/freelancer/gigs`);
  }

  getMyGigDetails(gigId: string): Observable<any> {
    return this.http.get(`${this.base}/freelancer/gigs/${gigId}`);
  }

  createGig(data: any): Observable<any> {
    return this.http.post(`${this.base}/freelancer/gigs`, data);
  }

  updateGig(gigId: string, data: any): Observable<any> {
    return this.http.put(`${this.base}/freelancer/gigs/${gigId}`, data);
  }

  deleteGig(gigId: string): Observable<any> {
    return this.http.delete(`${this.base}/freelancer/gigs/${gigId}`);
  }
}