import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';
import { environment } from '../../../environments/environment';

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
  selector: 'app-view-freelancer-profile',
  templateUrl: './view-freelancer-profile.page.html',
  styleUrls: ['./view-freelancer-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ViewFreelancerProfilePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // ---- Profile fields ----
  id: string = '';
  name: string = '';
  email: string = '';
  phone: string = '';
  title: string = '';
  bio: string = '';
  skillList: string[] = [];
  hourlyRate: number = 0;
  experienceYears: number = 0;
  projectsCompleted: number = 0;
  clientRating: number = 0;
  successRate: number = 0;
  cvName: string = '';
  avatarUrl: string = 'assets/avatar.png';
  projects: Project[] = [];
  profileStatus: ProfileStatus = 'draft';
  gigs: Gig[] = [];

  // ---- UI state ----
  activeTab: string = 'bio';
  isLoading = true;
  freelancerId: string = '';
  original_cv_name: string = '';

  get isTopRated(): boolean {
    return this.successRate >= 90;
  }

  get statusLabel(): string {
    const labels: Record<ProfileStatus, string> = {
      draft: 'Draft',
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected',
      blocked: '🚫 Blocked',
    };
    return labels[this.profileStatus];
  }

  constructor(
    private route: ActivatedRoute,
    private profileService: FreelancerProfileService,
    private router: Router,
    private actionSheetController: ActionSheetController,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.freelancerId = params.get('id') || '';
      if (this.freelancerId) {
        this.loadFreelancerProfile(this.freelancerId);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadFreelancerProfile(id: string): void {
    this.isLoading = true;
    console.log('Loading freelancer profile for ID:', id);

    this.profileService.getFreelancerProfile(id).subscribe({
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
          this.avatarUrl = `${environment.apiUrl}/uploads/avatars/${data.user.avatar_filename}`;
        } else {
          this.avatarUrl = 'assets/avatar.png';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load freelancer profile', err);
        this.isLoading = false;
      },
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    setTimeout(() => {
      const element = document.getElementById(tab);
      if (element && this.content) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  async openActionMenu(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: `Connect with ${this.name}`,
      buttons: [
        {
          text: 'Send Message',
          icon: 'chatbubble-outline',
          handler: () => {
            this.router.navigateByUrl(`/messages/${this.freelancerId}`);
          },
        },
        {
          text: 'View All Gigs',
          icon: 'briefcase-outline',
          handler: () => {
            this.router.navigateByUrl(`/freelancer-gigs/${this.freelancerId}`);
          },
        },
        {
          text: 'Hire Now',
          icon: 'checkmark-circle-outline',
          handler: () => {
            this.router.navigateByUrl(`/create-project/${this.freelancerId}`);
          },
        },
        {
          text: 'Report',
          icon: 'flag-outline',
          handler: () => {
            this.router.navigateByUrl(`/report/${this.freelancerId}`);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }
  async getfreelancersgigs(): Promise<void> {
    this.router.navigateByUrl(`/gigs?freelancerId=${this.freelancerId}`);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
