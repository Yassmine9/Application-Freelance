import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonIcon, IonSpinner, IonButton,
  IonModal, IonInput, IonItem, IonLabel,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, briefcaseOutline, starOutline,
  mailOutline, callOutline, locationOutline
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonIcon, IonSpinner, IonButton,
    IonModal, IonInput, IonItem, IonLabel,
    SideBarComponent
  ]
})
export class ProfilePage implements OnInit {
  userId!: string;
  role!: string;           // 'client' | 'freelancers'
  profile: any = null;
  isLoading = true;
  offersLoading = false;
  freelancersOffers: any[] = [];
  proposalFilter = 'all';
  isOwnerClient = false;
  showOfferModal = false;
  isSubmittingOffer = false;
  newOffer = { title: '', budget: null as number | null };
  cahierChargeFile: File | null = null;
  apiUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private toastCtrl: ToastController
  ) {
    addIcons({ personOutline, briefcaseOutline, starOutline, mailOutline, callOutline, locationOutline });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.role   = this.route.snapshot.paramMap.get('role') || 'client';
    this.isOwnerClient = this.role === 'client' && this.auth.isClient() && this.auth.getUserId() === this.userId;
    this.loadProfile();
    if (this.role === 'freelancers') {
      this.loadfreelancersOffers();
    }
  }

  loadProfile() {
    this.isLoading = true;
    this.api.getUserProfile(this.userId).subscribe({
      next: (res) => { this.profile = res; this.isLoading = false; },
      error: () => {
        // Fallback placeholder so the page still renders
        this.profile = { name: 'User #' + this.userId?.slice(-6), role: this.role };
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  loadfreelancersOffers() {
    this.offersLoading = true;
    const status = this.proposalFilter === 'all' ? undefined : this.proposalFilter;
    this.api.getOffersByfreelancers(this.userId, status).subscribe({
      next: (res) => {
        this.freelancersOffers = res || [];
        this.offersLoading = false;
      },
      error: () => {
        this.freelancersOffers = [];
        this.offersLoading = false;
      }
    });
  }

  setProposalFilter(filter: string) {
    this.proposalFilter = filter;
    this.loadfreelancersOffers();
  }

  openOfferModal() {
    this.showOfferModal = true;
  }

  closeOfferModal() {
    this.showOfferModal = false;
  }

  onCahierChargeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cahierChargeFile = input.files && input.files.length ? input.files[0] : null;
  }

  statusClass(status: string): string {
    return status === 'in_progress' ? 'in-progress' : status;
  }

  async createOffer() {
    if (!this.newOffer.title?.trim() || !this.newOffer.budget || !this.cahierChargeFile) {
      return this.toast('Please fill all required fields', 'warning');
    }

    const payload = new FormData();
    payload.append('title', this.newOffer.title.trim());
    payload.append('budget', String(this.newOffer.budget));
    payload.append('cahier_charge', this.cahierChargeFile);

    this.isSubmittingOffer = true;
    this.api.createOffer(payload).subscribe({
      next: async () => {
        this.isSubmittingOffer = false;
        this.showOfferModal = false;
        this.newOffer = { title: '', budget: null };
        this.cahierChargeFile = null;
        await this.toast('Offer posted!', 'success');
      },
      error: async (err) => {
        this.isSubmittingOffer = false;
        await this.toast(err?.error?.error || 'Failed to create offer', 'danger');
      }
    });
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}
