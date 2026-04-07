import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-pending',
  templateUrl: './registration-pending.page.html',
  styleUrls: ['./registration-pending.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RegistrationPendingPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    console.log('Registration Pending Page Loaded');
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to home page
   */
  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
