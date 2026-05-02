import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, laptopOutline, briefcaseOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dev-login',
  templateUrl: './dev-login.page.html',
  styleUrls: ['./dev-login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonSpinner
  ]
})
export class DevLoginPage implements OnInit {
  isLoading = false;
  error = '';
  currentRole = '';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({ personOutline, laptopOutline, briefcaseOutline });
  }

  ngOnInit() {
    this.currentRole = localStorage.getItem('role') || '';
  }

  loginAs(role: 'client' | 'freelancers') {
    this.isLoading = true;
    this.error = '';
    this.http.post<any>(`${environment.apiUrl}/auth/mock-login`, { role }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('role', res.role);
        this.isLoading = false;
        this.currentRole = role;
        this.router.navigate(['/offers']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.error || 'Cannot reach Flask backend';
      }
    });
  }
}