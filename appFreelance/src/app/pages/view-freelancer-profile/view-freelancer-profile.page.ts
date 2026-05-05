import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface Project { title: string; description: string; link: string; }
export interface Gig     { title: string; }
export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked';

@Component({
  selector: 'app-view-freelancers-profile',
  templateUrl: './view-freelancer-profile.page.html',
  styleUrls: ['./view-freelancer-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
  original_cv_name = '';

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

  constructor(
    private route:  ActivatedRoute,
    private profileService: FreelancerProfileService,
    private authService:    AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.freelancerId = params.get('id') || '';
      // Check ownership — same ID as logged-in user AND role is freelancer
      const loggedId = this.authService.getUserId();
      this.isOwner   = this.authService.isFreelancer() && loggedId === this.freelancerId;

      if (this.freelancerId) {
        this.loadFreelancerProfile(this.freelancerId);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadfreelancersProfile(id: string): void {
    this.isLoading = true;
    this.profileService.getFreelancerProfile(id).subscribe({
      next: (data) => {
        this.id               = data.user.id;
        this.name             = data.user.name             || '';
        this.email            = data.user.email            || '';
        this.phone            = data.user.phone            || '';
        this.title            = data.user.title            || '';
        this.bio              = data.user.bio              || '';
        this.skillList        = data.user.skills           || [];
        this.hourlyRate       = data.user.hourly_rate      || 0;
        this.experienceYears  = data.user.experience_years || 0;
        this.projectsCompleted= data.user.projects_completed || 0;
        this.clientRating     = data.user.client_rating    || 0;
        this.successRate      = data.user.success_rate     || 0;
        this.cvName           = data.user.cv_filename      || '';
        this.projects         = data.user.portfolio        || [];
        this.original_cv_name = this.name + '_cv';
        this.gigs = (data.user.gigs || [])
          .filter((g: Gig[] | null): g is Gig[] => g != null)
          .flat();
        this.profileStatus = data.user.status || 'draft';
        this.avatarUrl = data.user.avatar_filename
          ? `${environment.apiUrl}/uploads/avatars/${data.user.avatar_filename}`
          : 'assets/avatar.png';
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
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