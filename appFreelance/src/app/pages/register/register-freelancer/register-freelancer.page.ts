import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  showPassword: boolean = false;
  accepted: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    console.log('Register Page Loaded');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  onRegister(): void {
    if (this.validateForm()) {
      this.isLoading = true;
      
      const formData = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        password: this.password,
        freelanceType: this.freelanceType,
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