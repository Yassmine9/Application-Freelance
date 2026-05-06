import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GigService } from '../../services/gig.service';

@Component({
  selector: 'app-create-gig',
  templateUrl: './create-gig.page.html',
  styleUrls: ['./create-gig.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateGigPage implements OnInit {
  gig = {
    title: '',
    category: '',
    description: '',
    price: null,
    tags: '',
    duration: ''
  };
categories = ['Web Development', 'Design', 'Writing', 'Data Entry', 'SEO', 'Social Media', 'Translation'];
  constructor(
    private gigService: GigService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  async onSubmit() {
    // Validation
    if (!this.gig.title || !this.gig.description || !this.gig.price || !this.gig.duration) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please fill in all required fields.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creating gig...' });
    await loading.present();

    this.gigService.createGig(this.gig).subscribe({
      next: async (res) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Success',
          message: 'Gig created successfully!',
          buttons: [
            {
              text: 'OK',
              handler: () => this.router.navigate(['/my-gigs'])
            }
          ]
        });
        await alert.present();
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.error?.error || 'Failed to create gig.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  goBack() {
    this.router.navigate(['/my-gigs']);
  }
}

