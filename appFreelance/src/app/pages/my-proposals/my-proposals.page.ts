import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  IonSpinner, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, chevronForwardOutline } from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToolBarComponent } from '../../components/Tool-bar/toolbar.component';
import { FreelanceAuthHelper } from '../../services/freelance-auth-helper.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-proposals',
  templateUrl: './my-proposals.page.html',
  styleUrls: ['./my-proposals.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon,
    IonSpinner, IonButton,
    ToolBarComponent
  ]
})
export class MyProposalsPage implements OnInit {
  proposals: any[] = [];
  isLoading = true;
  apiUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private router: Router
  ) {
    addIcons({ documentTextOutline, chevronForwardOutline });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isFreelancer()) {
      this.router.navigateByUrl('/offers');
      return;
    }

    this.loadProposals();
  }

  loadProposals() {
    this.isLoading = true;
    this.api.getMyProposals().subscribe({
      next: (res) => {
        this.proposals = res || [];
        const offerIds = Array.from(new Set(this.proposals.map(p => p.offerId)));
        if (offerIds.length === 0) {
          this.isLoading = false;
          return;
        }

        forkJoin(
          offerIds.map((id) => this.api.getOffer(id).pipe(catchError(() => of(null))))
        ).subscribe({
          next: (offers) => {
            const map: Record<string, any> = {};
            offerIds.forEach((id, idx) => {
              if (offers[idx]) map[id] = offers[idx];
            });
            this.proposals = this.proposals.map((p) => ({
              ...p,
              offer: map[p.offerId]
            }));
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.proposals = [];
        this.isLoading = false;
      }
    });
  }
}
