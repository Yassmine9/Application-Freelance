import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl.replace(/\/api\/?$/, '');

export interface ActivityItem {
  text: string;
  time: string;
  color: 'green' | 'purple' | 'red' | 'blue' | 'amber';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin-panel.page.html',
  styleUrls: ['./admin-panel.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminPanelPage implements OnInit {

  // ── Stats (overview cards, read-only) ──────────────────
  stats = {
    total_users:       0,
    total_freelancers: 0,
    total_products:        0,
    total_purchases:    0,
  };
  statsLoading = true;

  // ── Pending counts (derived from loaded data) ──────────
  // These drive the Pending Actions section
  pendingFreelancers = 0;
  pendingClients     = 0;
  pendingGigs        = 0;
  pendingFeedback    = 0;

  openedSection: string | null = null;

  pendingFreelancersList: any[] = [];
  pendingClientsList: any[] = [];
  pendingGigsList: any[] = [];
  pendingFeedbackList: any[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Redirect if no token
    if (!this.getToken()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.loadStats();
    this.loadPendingCounts();
  }

  // ── Stats ──────────────────────────────────────────────
  loadStats() {
    this.statsLoading = true;
    this.http.get<any>(`${API_URL}/admin/stats`).subscribe({
      next: (data) => {
        this.stats = {
          total_users:       data.total_users       ?? 0,
          total_freelancers: data.total_freelancers ?? 0,
          total_products:        data.total_products        ?? 0,
          total_purchases:    data.total_purchases    ?? 0,
        };
        this.statsLoading = false;
      },
      error: () => { this.statsLoading = false; }
    });
  }

  // ── Pending counts ─────────────────────────────────────
  // Adjust the endpoint paths / filter logic to match your API.
 loadPendingCounts() {
  this.http.get<any[]>(`${API_URL}/admin/freelancers`)
    .subscribe({
      next: data => {
        this.pendingFreelancersList =
          data.filter(u => u.role === 'freelancer');

        this.pendingClientsList =
          data.filter(u => u.role === 'client');

        this.pendingFreelancers =
          this.pendingFreelancersList.length;

        this.pendingClients =
          this.pendingClientsList.length;
      }
    });
}

  // ── Navigation ─────────────────────────────────────────
  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  // ── Refresh ────────────────────────────────────────────
  refreshAll() {
    this.loadStats();
    this.loadPendingCounts();
  }

  doRefresh(event: any) {
    this.refreshAll();
    setTimeout(() => event.target.complete(), 1200);
  }

  toggleSection(section: string) {
  this.openedSection =
    this.openedSection === section ? null : section;
}

approveUser(id: string) {
  this.http.patch(`${API_URL}/admin/approve/${id}`, {})
    .subscribe(() => {
      this.refreshAll();
    });
}

rejectUser(id: string) {
  this.http.patch(`${API_URL}/admin/reject/${id}`, {})
    .subscribe(() => {
      this.refreshAll();
    });
}

approveGig(id: string) {
  this.http.patch(`${API_URL}/admin/gigs/${id}/approve`, {})
    .subscribe(() => {
      this.refreshAll();
    });
}

rejectGig(id: string) {
  this.http.patch(`${API_URL}/admin/gigs/${id}/reject`, {})
    .subscribe(() => {
      this.refreshAll();
    });
}

deleteFeedback(id: string) {
  this.http.delete(`${API_URL}/admin/feedback/${id}`)
    .subscribe(() => {
      this.refreshAll();
    });


}
}
