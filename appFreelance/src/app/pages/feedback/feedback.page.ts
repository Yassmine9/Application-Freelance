import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AlertController,
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class FeedbackPage {
  subject = '';
  message = '';
  contactEmail = '';
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly toastCtrl: ToastController,
  ) {}

  async submitFeedback(): Promise<void> {
    if (!this.subject.trim() || !this.message.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Missing information',
        message: 'Please add a subject and your feedback message.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Sending feedback...' });
    await loading.present();

    this.http
      .post(`${this.apiUrl}/auth/feedback`, {
        subject: this.subject.trim(),
        message: this.message.trim(),
        contactEmail: this.contactEmail.trim() || undefined,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Thanks! Your feedback was sent to admin.',
            duration: 1800,
            color: 'success',
            position: 'top',
          });
          await toast.present();

          this.subject = '';
          this.message = '';
          this.contactEmail = '';
          this.router.navigateByUrl('/home');
        },
        error: async (error: HttpErrorResponse) => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Send failed',
            message: error?.error?.error || 'Unable to send feedback right now.',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
  }
}
