import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FreelanceAuthHelper } from './freelance-auth-helper.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: FreelanceAuthHelper
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Offers
  getOffers(status?: string, clientId?: string, category?: string): Observable<any[]> {
    let params = new HttpParams(); 
    if (status) params = params.set('status', status);
    if (clientId) params = params.set('clientId', clientId);
    if (category && category !== 'All') params = params.set('category', category);
    return this.http.get<any[]>(`${this.base}/offers/`, { headers: this.headers(), params });
  }
  getOffer(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/offers/${id}`, { headers: this.headers() });
  }
  createOffer(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.base}/offers/`, data, { headers: this.headers() });
  }
  updateOffer(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/offers/${id}`, data, { headers: this.headers() });
  }
  deleteOffer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/offers/${id}`, { headers: this.headers() });
  }
  getMyOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/offers/my/offers`, { headers: this.headers() });
  }
  getOffersByfreelancers(freelancersId: string, proposalStatus?: string): Observable<any[]> {
    let params = new HttpParams();
    if (proposalStatus) params = params.set('proposalStatus', proposalStatus);
    return this.http.get<any[]>(`${this.base}/offers/by-freelancers/${freelancersId}`, { headers: this.headers(), params });
  }

  // Proposals
  getProposals(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/proposals/${offerId}`, { headers: this.headers() });
  }
  submitProposal(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.base}/proposals/`, data, { headers: this.headers() });
  }
  acceptProposal(proposalId: string): Observable<any> {
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/accept`, {}, { headers: this.headers() });
  }
  rejectProposal(proposalId: string): Observable<any> {
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/reject`, {}, { headers: this.headers() });
  }
  getMyProposals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/proposals/my/proposals`, { headers: this.headers() });
  }

  // Messages
  getMessages(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/messages/${offerId}`, { headers: this.headers() });
  }
  sendMessage(data: { receiverId: string; offerId: string; content: string }): Observable<any> {
    return this.http.post<any>(`${this.base}/messages/`, data, { headers: this.headers() });
  }
  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/messages/conversations`, { headers: this.headers() });
  }

  // Users / Profiles
  getUserProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/auth/profile/${userId}`, { headers: this.headers() });
  }
}
