import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GigService } from '../../services/gig.service';

@Component({
  selector: 'app-edit-gig',
  templateUrl: './edit-gig.page.html',
  styleUrls: ['./edit-gig.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditGigPage implements OnInit {
  gigId: string = '';
  gig = {
    title: '',
    description: '',
    category: '',
    price: null,
    duration: '',
    deliverables: ''
  };

  categories = ['Web Development', 'Design', 'Writing', 'Data Entry', 'SEO', 'Social Media', 'Translation'];
  durations = ['24 hours', '3 days', '1 week', '2 weeks', '1 month'];
  isLoading = true;

  constructor(
    private gigService: GigService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.gigId = this.route.snapshot.paramMap.get('id') || '';
    if (this.gigId) {
      this.loadGig();
    }
  }

  loadGig() {
    this.isLoading = true;
    this.gigService.getMyGigDetails(this.gigId).subscribe({
      next: (res) => {
        this.gig = res;
        this.isLoading = false;
      },
      error: async () => {
        this.isLoading = false;
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: 'Impossible de charger l\'annonce.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async onSubmit() {
    // Validation
    if (!this.gig.title || !this.gig.description || !this.gig.category || !this.gig.price ) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'missing fields',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Mise à jour de l\'annonce...' });
    await loading.present();

    this.gigService.updateGig(this.gigId, this.gig).subscribe({
      next: async (res) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Succès',
          message: 'Annonce mise à jour avec succès!',
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
          header: 'Erreur',
          message: err.error?.error || 'Erreur lors de la mise à jour de l\'annonce.',
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
