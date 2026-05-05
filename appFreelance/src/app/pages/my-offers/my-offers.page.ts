import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  IonSpinner, IonButton, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, chevronForwardOutline, peopleOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { ToolBarComponent } from '../../components/Tool-bar/toolbar.component';
import { FreelanceAuthHelper } from '../../services/freelance-auth-helper.service';
import { addOutline } from 'ionicons/icons';
@Component({
  selector: 'app-my-offers',
  templateUrl: './my-offers.page.html',
  styleUrls: ['./my-offers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon,
    IonSpinner, IonButton, IonFab, IonFabButton,
    ToolBarComponent
  ]
})
export class MyOffersPage implements OnInit {
  offers: any[] = [];
  isLoading = true;

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private router: Router
  ) {
    addIcons({ briefcaseOutline, chevronForwardOutline, peopleOutline, addOutline });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isClient()) {
      this.router.navigateByUrl('/offers');
      return;
    }

    this.loadOffers();
  }
  createOffer() {
    this.router.navigate(['/offers'], { queryParams: { create: '1' } });
  }

  loadOffers() {
    this.isLoading = true;
    this.api.getMyOffers().subscribe({
      next: (res) => {
        this.offers = res || [];
        // Load proposal counts for each offer
        this.offers.forEach((offer) => {
          this.api.getProposals(offer._id).subscribe({
            next: (proposals) => {
              offer.proposalCount = proposals.length;
              offer.pendingProposals = proposals.filter((p: any) => p.status === 'pending').length;
            },
            error: () => {
              offer.proposalCount = 0;
              offer.pendingProposals = 0;
            }
          });
        });
        this.isLoading = false;
      },
      error: () => {
        this.offers = [];
        this.isLoading = false;
      }
    });
  }

  viewProposals(offerId: string) {
    this.router.navigate(['/proposals', offerId]);
  }

  getInitials(clientId: string): string {
    return clientId ? clientId.slice(-2).toUpperCase() : 'CL';
  }
}