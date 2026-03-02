import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  showPassword: boolean = false;
  accepted: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    console.log('Register Client Page Loaded');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  onRegister(): void {
    if (this.validateForm()) {
      this.isLoading = true;

      const formData = {
        companyName: this.companyName,
        contactName: this.contactName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        password: this.password,
        industry: this.industry,
        accepted: this.accepted
      };

      console.log('Registration Form Data:', formData);

      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/registration-pending']);
      }, 1500);


    }
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