import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  IonSpinner, IonButton, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, cashOutline, calendarOutline, chatbubbleOutline, chevronForwardOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { FreelanceAuthHelper } from '../../services/freelance-auth-helper.service';
import { ToolBarComponent } from '../../components/Tool-bar/toolbar.component';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.page.html',
  styleUrls: ['./my-jobs.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon,
    IonSpinner, IonButton, IonRefresher, IonRefresherContent,
    ToolBarComponent,
  ]
})
export class MyJobsPage implements OnInit {
  jobs: any[] = [];
  isLoading = true;

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private router: Router
  ) {
    addIcons({ briefcaseOutline, cashOutline, calendarOutline, chatbubbleOutline, chevronForwardOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isfreelancers()) {
      this.router.navigateByUrl('/offers');
      return;
    }

    this.loadJobs();
  }

  loadJobs(event?: any) {
    this.isLoading = true;
    this.api.getMyJobs().subscribe({
      next: (res: any[]) => {

        this.jobs = res || [];
        this.isLoading = false;
        event?.target?.complete();
      },
      error: () => {
        this.jobs = [];
        this.isLoading = false;
        event?.target?.complete();
      }
    });
  }

  getChatLink(offer: any): any[] {
    return ['/chat', offer._id, offer.clientId || ''];
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'CL';
  }

  doRefresh(event: any) {
    this.loadJobs(event);
  }
}
