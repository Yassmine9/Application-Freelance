import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { freelancersProfileService } from '../../services/freelancer-profile.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from 'src/app/services/auth.service';
export interface Project {
  title: string;
  description: string;
  link: string;
}

export interface Gig {
  title: string;
}

export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked';

@Component({
  selector: 'app-view-freelancers-profile',
  templateUrl: './view-freelancer-profile.page.html',
  styleUrls: ['./view-freelancer-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [ReviewService],
})
export class ViewfreelancersProfilePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Profile data
  id               = '';
  name             = '';
  email            = '';
  phone            = '';
  title            = '';
  bio              = '';
  original_cv_name = '';
  skillList:  string[]  = [];
  hourlyRate       = 0;
  experienceYears  = 0;
  projectsCompleted= 0;
  clientRating     = 0;
  successRate      = 0;
  cvName           = '';
  avatarUrl        = 'assets/avatar.png';
  projects: Project[] = [];
  gigs:     Gig[]     = [];
  profileStatus: ProfileStatus = 'draft';

  // ---- Review state ----
  reviews:          any[]    = [];
  canReview:        boolean  = false;
  cannotReason:     string   = '';
  rating:           number   = 0;
  comment:          string   = '';
  submitted:        boolean  = false;
  isSubmitting:     boolean  = false;
  isLoadingReviews: boolean  = false;
  stars = [1, 2, 3, 4, 5];
  starLabels: { [key: number]: string } = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  // UI
  activeTab = 'bio';
  isLoading = true;
  freelancerId = '';

  /** true when the logged-in freelancer is viewing their own profile */
  isOwner = false;
  

  get statusLabel(): string {
    const labels: Record<ProfileStatus, string> = {
      draft:   'Draft',
      pending: '⏳ Pending',
      approved:'✅ Approved',
      rejected:'❌ Rejected',
      blocked: '🚫 Blocked',
    };
    return labels[this.profileStatus];
  }

  get isCommentValid(): boolean {
    return this.comment.trim().length >= 20 &&
           this.comment.trim().length <= 500;
  }

  get isFormValid(): boolean {
    return this.rating > 0 && this.isCommentValid;
  }
  constructor(
    private route:  ActivatedRoute,
    private profileService: freelancersProfileService,
    private authService:    AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private reviewService: ReviewService,
    
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.freelancerId = params.get('id') || '';
      // Check ownership — same ID as logged-in user AND role is freelancer
      const loggedId = this.authService.getUserId();
      this.isOwner   = this.authService.isfreelancers() && loggedId === this.freelancerId;

      if (this.freelancerId) {
        this.loadFreelancerProfile(this.freelancerId);
        this.loadReviews(this.freelancerId);
        this.checkCanReview(this.freelancerId);
      } else {
        this.isLoading = false;
      }
    });
  }

 loadFreelancerProfile(id: string): void {
    this.isLoading = true;
    console.log('Loading freelancer profile for ID:', id);

    this.profileService.getfreelancersProfile(id).subscribe({
      next: (data) => {
        console.log('Freelancer profile data:', data);

        this.id = data.user.id;
        this.name = data.user.name || '';
        this.email = data.user.email || '';
        this.phone = data.user.phone || '';
        this.title = data.user.title || '';
        this.bio = data.user.bio || '';
        this.skillList = data.user.skills || [];
        this.hourlyRate = data.user.hourly_rate || 0;
        this.experienceYears = data.user.experience_years || 0;
        this.projectsCompleted = data.user.projects_completed || 0;
        this.clientRating = data.user.client_rating || 0;
        this.successRate = data.user.success_rate || 0;
        this.cvName = data.user.cv_filename || '';
        this.projects = data.user.portfolio || [];
        this.original_cv_name = this.name.concat('_cv');
        this.gigs = (data.user.gigs || [])
          .filter((g: Gig[] | null): g is Gig[] => g != null)
          .flat();
        this.profileStatus = data.user.status || 'draft';

        if (data.user.avatar_filename) {
          this.avatarUrl = `http://127.0.0.1:5000/api/uploads/avatars/${data.user.avatar_filename}`;
        } else {
          this.avatarUrl = 'appFreelance/src/assets/avatar.png';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load freelancer profile', err);
        this.isLoading = false;
      },
    });
  }
 

  // ---- Reviews ------------------------------------------------

  loadReviews(freelancerId: string): void {
    this.isLoadingReviews = true;
    this.reviewService.getFreelancerReviews(freelancerId).subscribe({
      next:  (data) => {
        this.reviews          = data;
        this.isLoadingReviews = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoadingReviews = false;
      }
    });
  }

  checkCanReview(freelancerId: string): void {
    this.reviewService.canReview(freelancerId).subscribe({
      next:  (res) => {
        this.canReview    = res.can_review;
        this.cannotReason = res.reason || '';
      },
      error: (err) => console.error('Can review check failed', err)
    });
  }

  setRating(star: number): void {
    this.rating = star;
  }
downloadCv()
{
  this.profileService.downloadCv().subscribe({
    next: (blob: Blob) => {
      console.log('Blob received', blob); // you already see this

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = this.original_cv_name || 'cv.pdf'; // force filename
      document.body.appendChild(a); // needed for Firefox
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download error', err);
    }
  });
}
  submitReview(): void {
    this.submitted = true;
    if (!this.isFormValid) return;

    this.isSubmitting = true;

    this.reviewService.submitReview({
      freelancer_id: this.freelancerId,
      rating:        this.rating,
      comment:       this.comment.trim()
    }).subscribe({
      next: () => {
        // Reset form
        this.canReview    = false;
        this.rating       = 0;
        this.comment      = '';
        this.submitted    = false;
        this.isSubmitting = false;

        // Reload reviews to show the new one
        this.loadReviews(this.freelancerId);
      },
      error: (err) => {
        console.error('Failed to submit review', err?.error?.error);
        this.isSubmitting = false;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    setTimeout(() => {
      const el = document.getElementById(tab);
      if (el && this.content) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  goToEdit():    void { this.router.navigateByUrl('/freelancer-edit'); }
  goToMyGigs():  void { this.router.navigateByUrl('/my-gigs'); }

  viewAllGigs(): void {
    this.router.navigateByUrl(`/gigs?freelancerId=${this.freelancerId}`);
  }
  goToMessages(): void {
    this.router.navigateByUrl('/conversations');
  }
  async openActionMenu(): Promise<void> {
    // Owner gets a management sheet; visitor gets a contact sheet
    const buttons = this.isOwner
      ? [
          { text: 'Edit Profile',  icon: 'create-outline',    handler: () => this.goToEdit() },
          { text: 'My Gigs',       icon: 'briefcase-outline', handler: () => this.goToMyGigs() },
          { text: 'Cancel', role: 'cancel' },
        ]
      : [
          { text: 'Send Message',  icon: 'chatbubble-outline',    handler: () => this.router.navigateByUrl(`/messages/${this.freelancerId}`) },
          { text: 'View All Gigs', icon: 'briefcase-outline',     handler: () => this.viewAllGigs() },
          { text: 'Hire Now',      icon: 'checkmark-circle-outline', handler: () => this.router.navigateByUrl(`/create-project/${this.freelancerId}`) },
          { text: 'Report',        icon: 'flag-outline',          handler: () => this.router.navigateByUrl(`/report/${this.freelancerId}`) },
          { text: 'Cancel', role: 'cancel' },
        ];

    const sheet = await this.actionSheetController.create({
      header: this.isOwner ? 'My Profile' : `Connect with ${this.name}`,
      buttons,
    });
    await sheet.present();
  }

  trackByIndex(i: number): number { return i; }
}