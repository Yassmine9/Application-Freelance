import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register-freelancer.page.html',
  styleUrls: ['./register-freelancer.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RegisterPage implements OnInit {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  freelanceType: string = '';
  otherField: string = '';

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

    this.authService.registerFreelancer({
      email: this.email,
      password: this.password,
      name: `${this.firstName} ${this.lastName}`,
      skills: this.freelanceType ? [this.freelanceType] : [],
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
    if (!this.firstName.trim()) {
      console.warn('First name is required');
      return false;
    }

    if (!this.lastName.trim()) {
      console.warn('Last name is required');
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

    if (!this.freelanceType) {
      console.warn('Please select a freelance type');
      return false;
    }

    if (this.freelanceType === 'other' && !this.otherField.trim()) {
      console.warn('Please describe your field');
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
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length >= 8 && /^[+\d][\d\s\-().]{7,}$/.test(cleaned);
  }

}