import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl.replace(/\/api\/?$/, '');

@Component({
  selector: 'app-admin',
  templateUrl: './admin-panel.page.html',
  styleUrls: ['./admin-panel.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminPanelPage implements OnInit {

  stats = {
    total_users:       0,
    total_freelancers: 0,
    total_products:    0,
    total_purchases:   0,
  };

  freelancers:      any[] = [];
  statsLoading      = true;
  freelancersLoading = true;
  clients: any[] = [];
  clientsLoading = true;
  constructor(private readonly router: Router, private readonly http: HttpClient) {}

  ngOnInit() {
    // Redirect if no token
    if (!this.getToken()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.loadStats();
    this.loadFreelancers();
    this.loadClients();
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  loadStats() {
    this.statsLoading = true;
    this.http.get<any>(`${API_URL}/admin/stats`, { headers: this.getAuthHeaders() }).subscribe({
      next:  (data) => { this.stats = data; this.statsLoading = false; },
      error: (err) => {
        console.error('Stats error:', err);
        if (err.status === 401) this.router.navigate(['/admin-login']);
        this.statsLoading = false;
      }
    });
  }

  loadFreelancers() {
    this.freelancersLoading = true;
    this.http.get<any[]>(`${API_URL}/admin/freelancers`, { headers: this.getAuthHeaders() }).subscribe({
      next:  (data) => { this.freelancers = data; this.freelancersLoading = false; },
      error: (err) => {
        console.error('Freelancers error:', err);
        if (err.status === 401) this.router.navigate(['/admin-login']);
        this.freelancersLoading = false;
      }
    });
  }

  approve(f: any) {
    f._processing = 'approve';
    this.http.patch(`${API_URL}/admin/approve/${f._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next:  () => this.removeFreelancer(f._id),
      error: (err) => {
        console.error('Approve error:', err);
        f._processing = null;
      }
    });
  }

  reject(f: any) {
    f._processing = 'reject';
    this.http.patch(`${API_URL}/admin/reject/${f._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next:  () => this.removeFreelancer(f._id),
      error: (err) => {
        console.error('Reject error:', err);
        f._processing = null;
      }
    });
  }

  block(f: any) {
    f._processing = 'block';
    this.http.patch(`${API_URL}/admin/block/${f._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next:  () => {
        f._processing = null;
        f.is_blocked = true;
        this.loadStats();
      },
      error: (err) => {
        console.error('Block error:', err);
        f._processing = null;
      }
    });
  }

  unblock(f: any) {
    f._processing = 'unblock';
    this.http.patch(`${API_URL}/admin/unblock/${f._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next:  () => {
        f._processing = null;
        f.is_blocked = false;
        this.loadStats();
      },
      error: (err) => {
        console.error('Unblock error:', err);
        f._processing = null;
      }
    });
  }

  removeFreelancer(id: string) {
    this.freelancers = this.freelancers.filter(f => f._id !== id);
    this.loadStats();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  refreshAll() {
    this.loadStats();
    this.loadFreelancers();
  }

  doRefresh(event: any) {
    this.refreshAll();
    setTimeout(() => event.target.complete(), 1000);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
   loadClients() {
    this.clientsLoading = true;
    this.http.get<any[]>(`${API_URL}/admin/clients`, { headers: this.getAuthHeaders() }).subscribe({
      next: (data) => { this.clients = data; this.clientsLoading = false; },
      error: (err) => {
        console.error('Clients error:', err);
        if (err.status === 401) this.router.navigate(['/admin-login']);
        this.clientsLoading = false;
      }
    });
  }
    approveClient(c: any) {
    c._processing = 'approve';
    this.http.patch(`${API_URL}/admin/approve/${c._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => this.removeClient(c._id),
      error: () => { c._processing = null; }
    });
  }

  rejectClient(c: any) {
    c._processing = 'reject';
    this.http.patch(`${API_URL}/admin/reject/${c._id}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => this.removeClient(c._id),
      error: () => { c._processing = null; }
    });
  }

  removeClient(id: string) {
    this.clients = this.clients.filter(c => c._id !== id);
    this.loadStats();
  }
}
