import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

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
  clients:          any[] = [];
  activeTab:        string = 'freelancers'; 
  statsLoading      = true;
  usersLoading      = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadPendingUsers();
  }

  loadStats() {
    this.statsLoading = true;
    this.http.get<any>(`${API_URL}/admin/stats`).subscribe({
      next:  (data) => { this.stats = data; this.statsLoading = false; },
      error: ()     => { this.statsLoading = false; }
    });
  }

  loadPendingUsers() {
    this.usersLoading = true;
    this.http.get<any[]>(`${API_URL}/admin/freelancers`).subscribe({
      next: (data) => {
        // Separate users by role
        this.freelancers = data.filter(u => u.role === 'freelancers');
        this.clients = data.filter(u => u.role === 'client');
        this.usersLoading = false;
      },
      error: () => {
        this.freelancers = [];
        this.clients = [];
        this.usersLoading = false;
      }
    });
  }

  approve(user: any) {
    user._processing = 'approve';
    this.http.patch(`${API_URL}/admin/approve/${user._id}`, {}).subscribe({
      next:  () => this.removeUser(user._id),
      error: () => { user._processing = null; }
    });
  }

  reject(user: any) {
    user._processing = 'reject';
    this.http.patch(`${API_URL}/admin/reject/${user._id}`, {}).subscribe({
      next:  () => this.removeUser(user._id),
      error: () => { user._processing = null; }
    });
  }

  removeUser(id: string) {
    this.freelancers = this.freelancers.filter(f => f._id !== id);
    this.clients = this.clients.filter(c => c._id !== id);
    this.loadStats();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getUserTypeLabel(user: any): string {
    return user.role === 'freelancers' ? 'freelancers' : 'Client';
  }

  getUserTypeIcon(user: any): string {
    return user.role === 'freelancers' ? 'briefcase-outline' : 'store-outline';
  }

  getTotalPending(): number {
    return this.freelancers.length + this.clients.length;
  }

  refreshAll() {
    this.loadStats();
    this.loadPendingUsers();
  }

  doRefresh(event: any) {
    this.refreshAll();
    setTimeout(() => event.target.complete(), 1000);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}