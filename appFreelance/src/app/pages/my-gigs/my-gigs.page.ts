import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { GigService } from '../../services/gig.service';

@Component({
  selector: 'app-my-gigs',
  templateUrl: './my-gigs.page.html',
  styleUrls: ['./my-gigs.page.scss'],
  imports: [IonicModule,CommonModule,FormsModule],
})
export class MyGigsPage implements OnInit {

  gigs: any[] = [];
  isLoading = true;
  error = '';
  // Promotion properties
  showPromoteModal = false;
  selectedGig: any = null;
  selectedPlan = '';
  promotionPlans: any = {};
  promoting = false;
  constructor(
    private gigService: GigService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadMyGigs();
    this.loadPromotionPlans();
  }

  // reload every time page is visited
  ionViewWillEnter() {
    this.loadMyGigs();
  }

  loadMyGigs() {
    this.isLoading = true;
    this.gigService.getMyGigs().subscribe({
      next: (res) => {
        this.gigs = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load your gigs';
        this.isLoading = false;
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/create-gig']);
  }

  goToEdit(gigId: string) {
    this.router.navigate(['/edit-gig', gigId]);
  }

  async confirmDelete(gigId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Gig',
      message: 'Are you sure you want to delete this gig?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteGig(gigId)
        }
      ]
    });
    await alert.present();
  }

  deleteGig(gigId: string) {
    this.gigService.deleteGig(gigId).subscribe({
      next: async () => {
        // remove from list without reloading
        this.gigs = this.gigs.filter(g => g._id !== gigId);
        const toast = await this.toastCtrl.create({
          message: 'Gig deleted successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Failed to delete gig',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      draft:    'medium',
      pending:  'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'medium';
  }
    // ── Promotion helpers ─────────────────────────────────

  loadPromotionPlans() {
    this.gigService.getPromotionPlans().subscribe({
      next: (plans) => (this.promotionPlans = plans),
      error: (err) => console.error('Failed to load promotion plans', err)
    });
  }

  getDaysLeft(endDate: string): number {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  canPromote(gig: any): boolean {
    return gig.status === 'approved' && gig.promotion?.status !== 'active';
  }

  promoteGig(gig: any) {
    this.selectedGig = gig;
    this.selectedPlan = '';
    this.showPromoteModal = true;
  }

  closePromoteModal() {
    this.showPromoteModal = false;
    this.selectedGig = null;
    this.selectedPlan = '';
    this.promoting = false;
  }

  submitPromotion() {
    if (!this.selectedPlan) {
      this.presentToast('Please select a plan', 'warning');
      return;
    }
    this.promoting = true;
    this.gigService.promoteGig(this.selectedGig._id, { plan: this.selectedPlan }).subscribe({
      next: async () => {
        await this.presentToast(`Gig promoted with ${this.selectedPlan} plan!`, 'success');
        this.closePromoteModal();
        this.loadMyGigs(); // refresh list to show sponsored badge
      },
      error: async (err) => {
        const msg = err.error?.error || 'Promotion failed';
        await this.presentToast(msg, 'danger');
        this.promoting = false;
      }
    });
  }

  async cancelPromotion(gig: any) {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Promotion?',
      message: 'No refund will be given. Are you sure?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, cancel',
          handler: () => {
            this.gigService.cancelPromotion(gig._id).subscribe({
              next: async () => {
                await this.presentToast('Promotion cancelled', 'success');
                this.loadMyGigs();
              },
              error: async (err) => {
                const msg = err.error?.error || 'Cancel failed';
                await this.presentToast(msg, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}