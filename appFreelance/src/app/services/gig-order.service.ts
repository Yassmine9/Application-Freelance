import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GigOrderService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers() {
    const token = localStorage.getItem('auth_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ─────────────────────────────────────────────────────────
  // Client actions (order placement & management)
  // ─────────────────────────────────────────────────────────

  /** Place a new order on a gig */
  placeOrder(gigId: string, requirements: string): Observable<any> {
    return this.http.post(`${this.base}/gigorders`, { gig_id: gigId, requirements }, this.headers());
  }

  /** Client marks order as completed */
  completeOrder(orderId: string): Observable<any> {
    return this.http.patch(`${this.base}/gigorders/${orderId}/complete`, {}, this.headers());
  }

  /** Client requests a revision on a delivered order */
  requestRevision(orderId: string, note: string): Observable<any> {
    return this.http.patch(`${this.base}/gigorders/${orderId}/revision`, { note }, this.headers());
  }

  // ─────────────────────────────────────────────────────────
  // Freelancer actions
  // ─────────────────────────────────────────────────────────

  /** Freelancer accepts a pending order */
  acceptOrder(orderId: string): Observable<any> {
    return this.http.patch(`${this.base}/gigorders/${orderId}/accept`, {}, this.headers());
  }

  /** Freelancer delivers completed work */
  deliverOrder(orderId: string, message: string, fileUrl?: string): Observable<any> {
    return this.http.patch(`${this.base}/gigorders/${orderId}/deliver`, { message, file_url: fileUrl }, this.headers());
  }

  // ─────────────────────────────────────────────────────────
  // Cancel (both client & freelancer)
  // ─────────────────────────────────────────────────────────

  /** Cancel an order with a reason */
  cancelOrder(orderId: string, reason: string): Observable<any> {
    return this.http.patch(`${this.base}/gigorders/${orderId}/cancel`, { reason }, this.headers());
  }

  // ─────────────────────────────────────────────────────────
  // Query endpoints
  // ─────────────────────────────────────────────────────────

  /** Get all orders for the authenticated client (optional status filter) */
  getClientOrders(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get(`${this.base}/client/gigorders`, { params, ...this.headers() });
  }

  /** Get all orders for the authenticated freelancer (optional status filter) */
  getFreelancerOrders(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get(`${this.base}/freelancer/gigorders`, { params, ...this.headers() });
  }

  /** Get a single order by ID (user must be client or freelancer of that order) */
  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.base}/gigorders/${orderId}`, this.headers());
  }
}