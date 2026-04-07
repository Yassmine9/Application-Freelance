import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonIcon, IonSpinner, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, briefcaseOutline, starOutline,
  mailOutline, callOutline, locationOutline
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonIcon, IonSpinner, IonButton
  ]
})
export class ProfilePage implements OnInit {
  userId!: string;
  role!: string;           // 'client' | 'freelancer'
  profile: any = null;
  isLoading = true;

  constructor(private route: ActivatedRoute, private api: ApiService) {
    addIcons({ personOutline, briefcaseOutline, starOutline, mailOutline, callOutline, locationOutline });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.role   = this.route.snapshot.paramMap.get('role') || 'client';
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.api.getUserProfile(this.userId).subscribe({
      next: (res) => { this.profile = res; this.isLoading = false; },
      error: () => {
        // Fallback placeholder so the page still renders
        this.profile = { name: 'User #' + this.userId?.slice(-6), role: this.role };
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
