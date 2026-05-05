import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { GigOrderService } from '../../services/gig-order.service';
import { GigService } from '../../services/gig.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-gig-order-placement',
  templateUrl: './gig-order-placement.page.html',
  styleUrls: ['./gig-order-placement.page.scss'],
  imports: [IonicModule,CommonModule,FormsModule],
})
export class GigOrderPlacementPage implements OnInit {
  gigId: string = '';
  gig: any = null;
  requirements: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gigService: GigService,
    private gigOrderService: GigOrderService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.gigId = this.route.snapshot.paramMap.get('gigId') || '';
    if (!this.gigId) {
      this.showErrorAndGoBack('No gig specified.');
      return;
    }
    this.loadGigDetails();
  }

  async loadGigDetails() {
    const loading = await this.loadingCtrl.create({ message: 'Loading gig...' });
    await loading.present();

    this.gigService.getGigDetails(this.gigId).subscribe({
      next: (gig) => {
        this.gig = gig;
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.showErrorAndGoBack('Failed to load gig details.');
      }
    });
  }

  async placeGigOrder() {
    if (!this.requirements.trim()) {
      this.showAlert('Requirements required', 'Please describe your requirements.');
      return;
    }
    if (this.requirements.length < 20) {
      this.showAlert('Too short', 'Requirements must be at least 20 characters.');
      return;
    }
    if (this.requirements.length > 1000) {
      this.showAlert('Too long', 'Maximum 1000 characters allowed.');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Placing gig order...' });
    await loading.present();

    this.gigOrderService.placeOrder(this.gigId, this.requirements).subscribe({
      next: (response) => {
        loading.dismiss();
        this.isSubmitting = false;
        this.router.navigate(['/gig-orders', response.order_id], { replaceUrl: true });
      },
      error: (error) => {
        loading.dismiss();
        this.isSubmitting = false;
        const msg = error.error?.error || 'Failed to place gig order.';
        this.showAlert('Order failed', msg);
      }
    });
  }

  private async showErrorAndGoBack(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: [{
        text: 'OK',
        handler: () => this.router.navigate(['/gigs'], { replaceUrl: true })
      }]
    });
    alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    alert.present();
  }
}