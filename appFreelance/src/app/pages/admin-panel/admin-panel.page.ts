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
  statsLoading      = true;
  freelancersLoading = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadFreelancers();
  }

  loadStats() {
    this.statsLoading = true;
    this.http.get<any>(`${API_URL}/admin/stats`).subscribe({
      next:  (data) => { this.stats = data; this.statsLoading = false; },
      error: ()     => { this.statsLoading = false; }
    });
  }

  loadFreelancers() {
    this.freelancersLoading = true;
    this.http.get<any[]>(`${API_URL}/admin/freelancers`).subscribe({
      next:  (data) => { this.freelancers = data; this.freelancersLoading = false; },
      error: ()     => { this.freelancers = []; this.freelancersLoading = false; }
    });
  }

  approve(f: any) {
    f._processing = 'approve';
    this.http.patch(`${API_URL}/admin/approve/${f._id}`, {}).subscribe({
      next:  () => this.removeFreelancer(f._id),
      error: () => { f._processing = null; }
    });
  }

  reject(f: any) {
    f._processing = 'reject';
    this.http.patch(`${API_URL}/admin/reject/${f._id}`, {}).subscribe({
      next:  () => this.removeFreelancer(f._id),
      error: () => { f._processing = null; }
    });
  }

  removeFreelancer(id: string) {
    this.freelancers = this.freelancers.filter(f => f._id !== id);
    this.loadStats(); // refresh counts after action
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
}