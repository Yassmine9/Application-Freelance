import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonBackButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput,
  IonTextarea, IonList, IonBadge,
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

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.page.html',
  styleUrls: ['./proposals.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonBackButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput,
    IonTextarea, IonList, IonBadge
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
  newProposal = { amount: null as number | null, message: '' };

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
    if (!this.newProposal.amount || !this.newProposal.message.trim()) {
      return this.toast('Please fill all fields', 'warning');
    }
    this.isSubmitting = true;
    this.api.submitProposal({
      offerId: this.offerId,
      amount: this.newProposal.amount,
      message: this.newProposal.message
    }).subscribe({
      next: async () => {
        this.newProposal = { amount: null, message: '' };
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

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}