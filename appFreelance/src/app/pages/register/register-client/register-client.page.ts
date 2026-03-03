import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.page.html',
  styleUrls: ['./register-client.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RegisterClientPage implements OnInit {

  companyName: string = '';
  contactName: string = '';
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  industry: string = '';
  otherIndustry: string = '';

  showPassword: boolean = false;
  accepted: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onRegister(): Promise<void> {
    if (!this.validateForm()) return;

    const loading = await this.loadingCtrl.create({ message: 'Inscription...' });
    await loading.present();

    this.authService.registerClient({
      email: this.email,
      password: this.password,
      name: this.contactName,
      company_name: this.companyName,
      phone: this.phoneNumber
    }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigate(['/registration-pending']);
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: err.error?.error || 'Erreur lors de l\'inscription.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }


  private validateForm(): boolean {
    if (!this.companyName.trim()) {
      console.warn('Company name is required');
      return false;
    }

    if (!this.contactName.trim()) {
      console.warn('Contact name is required');
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      console.warn('Invalid email format');
      return false;
    }

    if (!this.isValidPhone(this.phoneNumber)) {
      console.warn('Invalid phone number');
      return false;
    }

    if (this.password.length < 8) {
      console.warn('Password must be at least 8 characters');
      return false;
    }

    if (!this.industry) {
      console.warn('Please select an industry');
      return false;
    }

    if (this.industry === 'other' && !this.otherIndustry.trim()) {
      console.warn('Please describe your industry');
      return false;
    }

    if (!this.accepted) {
      console.warn('You must accept the terms and conditions');
      return false;
    }

    return true;
  }


  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

}