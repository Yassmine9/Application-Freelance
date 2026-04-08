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

  constructor(
    private gigService: GigService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadMyGigs();
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
}
