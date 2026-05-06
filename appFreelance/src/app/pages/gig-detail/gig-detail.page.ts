import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GigService } from '../../services/gig.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-gig-detail',
  templateUrl: './gig-detail.page.html',
  styleUrls: ['./gig-detail.page.scss'],
    imports: [IonicModule,CommonModule,FormsModule],

})
export class GigDetailPage implements OnInit {

  gig: any = null;
  gigId: string | null = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,    // ← reads the id from the URL
    private router: Router,
    private gigService: GigService
  ) {}

  ngOnInit() {
    const gigId = this.route.snapshot.paramMap.get('id');  // ← gets abc123 from URL
    if (gigId) {
      this.loadGig(gigId);
    }
  }

  loadGig(gigId: string) {
    this.isLoading = true;
    this.gigService.getGigDetails(gigId).subscribe({
      next: (res) => {
        this.gig = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Gig not found';
        this.isLoading = false;
      }
    });
  }

  orderGig(gigId: string) {

    this.router.navigate(['/gig-order/new', gigId]);
  }
}