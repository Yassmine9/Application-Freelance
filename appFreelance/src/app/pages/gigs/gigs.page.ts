import { Component, OnInit } from '@angular/core';
import { GigService } from '../../services/gig.service';
import { IonicModule, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gigs',
  templateUrl: './gigs.page.html',
  styleUrls: ['./gigs.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GigsPage implements OnInit {
  gigs: any[] = [];
  filteredGigs: any[] = [];
  isLoading = true;
  error = '';
  searchQuery = '';

  constructor(private gigService: GigService, private router: Router) {}

  ngOnInit() {
    this.loadGigs();
  }

  loadGigs() {
    this.isLoading = true;
    this.gigService.getAllGigs().subscribe({
      next: (res) => {
        this.gigs = res;
        this.filteredGigs = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load gigs';
        this.isLoading = false;
      }
    });
  }

  // called every time user types in search bar
  onSearch(event: any) {
    const query = event.target.value.toLowerCase().trim();

    if (!query) {
      this.filteredGigs = this.gigs;   // empty search → show all
      return;
    }

    // if user types → call backend search
    this.gigService.searchGigs(query).subscribe({
      next: (res) => {
        this.filteredGigs = res;
      },
      error: () => {
        this.filteredGigs = [];
      }
    });
  }

  // navigate to gig detail page
  openGig(gigId: string) {
   this.router.navigate(['/gig-detail', gigId]);
  }
}
