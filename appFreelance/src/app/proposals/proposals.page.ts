import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonBackButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput,
  IonList, IonBadge,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chatbubblesOutline, checkmarkOutline, closeOutline,
  cashOutline, calendarOutline, checkmarkCircleOutline, documentTextOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.page.html',
  styleUrls: ['./proposals.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonBackButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput,
    IonList, IonBadge
  ]
})
export class ProposalsPage implements OnInit {
  offerId!: string;
  offer: any = null;
  proposals: any[] = [];
  isLoading = false;
  isSubmitting = false;
  isClient = false;
  isFreelancer = false;
  currentUserId = '';
  newProposal = { amount: null as number | null };
  coverLetterFile: File | null = null;
  apiUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ chatbubblesOutline, checkmarkOutline, closeOutline, cashOutline, calendarOutline, checkmarkCircleOutline, documentTextOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('id')!;
    this.isClient = this.auth.isClient();
    this.isFreelancer = this.auth.isFreelancer();
    this.currentUserId = this.auth.getUserId();
    this.loadOffer();
    this.loadProposals();
  }

  loadOffer() {
    this.api.getOffer(this.offerId).subscribe({ next: (res) => this.offer = res, error: () => {} });
  }

  loadProposals() {
    this.isLoading = true;
    this.api.getProposals(this.offerId).subscribe({
      next: (res) => { this.proposals = res; this.isLoading = false; },
      error: async () => { this.isLoading = false; await this.toast('Failed to load proposals', 'danger'); }
    });
  }

  async submitProposal() {
    if (!this.newProposal.amount || !this.coverLetterFile) {
      return this.toast('Please fill all fields', 'warning');
    }
    this.isSubmitting = true;
    const payload = new FormData();
    payload.append('offerId', this.offerId);
    payload.append('amount', String(this.newProposal.amount));
    payload.append('cover_letter', this.coverLetterFile);
    this.api.submitProposal(payload).subscribe({
      next: async () => {
        this.newProposal = { amount: null };
        this.coverLetterFile = null;
        this.isSubmitting = false;
        await this.toast('Proposal submitted!', 'success');
        this.loadProposals();
      },
      error: async (err) => {
        this.isSubmitting = false;
        await this.toast(err?.error?.error || 'Failed', 'danger');
      }
    });
  }

  async confirmAccept(proposal: any) {
    const alert = await this.alertCtrl.create({
      header: 'Accept Proposal',
      message: 'Accept this proposal? All others will be rejected.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Accept', handler: () => this.acceptProposal(proposal._id) }
      ]
    });
    await alert.present();
  }

  acceptProposal(id: string) {
    this.api.acceptProposal(id).subscribe({
      next: async () => {
        await this.toast('Proposal accepted!', 'success');
        this.loadProposals();
        this.loadOffer();
      },
      error: async (err) => this.toast(err?.error?.error || 'Failed', 'danger')
    });
  }

  rejectProposal(id: string) {
    this.api.rejectProposal(id).subscribe({
      next: async () => { await this.toast('Proposal rejected', 'medium'); this.loadProposals(); },
      error: async () => this.toast('Failed', 'danger')
    });
  }

  get alreadySubmitted(): boolean {
    return this.proposals.some(p => p.freelancerId === this.currentUserId);
  }

  getInitials(id: string): string {
    return id ? id.slice(-2).toUpperCase() : '??';
  }

  getAcceptedFreelancerId(): string {
    const accepted = this.proposals.find(p => p.status === 'accepted');
    return accepted?.freelancerId || '';
  }

  onCoverLetterSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.coverLetterFile = input.files && input.files.length ? input.files[0] : null;
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}