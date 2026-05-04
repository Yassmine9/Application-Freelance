import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-gigs',
  templateUrl: './admin-gigs.page.html',
  styleUrls: ['./admin-gigs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminGigsPage implements OnInit {
  gigs: any[] = [];
  loading = true;
  filterStatus = 'all';
  openedGig: string | null = null;
  
  toggleGig(id: string) {
    this.openedGig =
      this.openedGig === id ? null : id;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadGigs();
  }

  loadGigs(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/gigs`).subscribe({
      next: (data) => {
        this.gigs = data || [];
        this.loading = false;

        if (event) {
          event.target.complete();
        }
      },

      error: () => {
        this.gigs = [];
        this.loading = false;

        if (event) {
          event.target.complete();
        }

        this.showToast('Failed to load gigs', 'danger');
      }
    });
  }

  get filteredGigs(): any[] {
    if (this.filterStatus === 'all') {
      return this.gigs;
    }

    return this.gigs.filter(
      g => (g.status || 'pending') === this.filterStatus
    );
  }

  approveGig(gig: any) {
    if (gig._processing || gig.status === 'approved') return;

    gig._processing = 'approve';

    this.http.patch(
      `${API_URL}/admin/gigs/${gig._id}/approve`,
      {}
    ).subscribe({
      next: async () => {
        gig.status = 'approved';
        gig._processing = null;

        await this.showToast('Gig approved', 'success');
      },

      error: async () => {
        gig._processing = null;

        await this.showToast('Approval failed', 'danger');
      }
    });
  }

  rejectGig(gig: any) {
    if (gig._processing || gig.status === 'rejected') return;

    gig._processing = 'reject';

    this.http.patch(
      `${API_URL}/admin/gigs/${gig._id}/reject`,
      {}
    ).subscribe({
      next: async () => {
        gig.status = 'rejected';
        gig._processing = null;

        await this.showToast('Gig rejected', 'warning');
      },

      error: async () => {
        gig._processing = null;

        await this.showToast('Rejection failed', 'danger');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'success';

      case 'rejected':
        return 'danger';

      default:
        return 'warning';
    }
  }

  setFilter(filter: string) {
    this.filterStatus = filter;
  }

  doRefresh(event: any) {
    this.loadGigs(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'top',
      color,
    });

    await toast.present();
  }
}