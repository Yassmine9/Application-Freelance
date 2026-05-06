import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientProfileService, ClientProjectOffer, freelancersRequest, ClientProfile } from '../../services/client-profile.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.page.html',
  styleUrls: ['./client-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ClientProfilePage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // ---- Profile fields ----
  id: string = '';
  name: string = '';
  email: string = '';
  phone: string = '';
  company: string = '';
  bio: string = '';
  website: string = '';
  avatarFile: File | null = null;
  avatarUrl: string = 'assets/avatar.png';
  profileStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked' = 'draft';

  // ---- Client Stats ----
  totalSpent: number = 0;
  activeProjects: number = 0;
  completedProjects: number = 0;
  freelancersRating: number = 0;

  // ---- Data from API ----
  projectOffers: ClientProjectOffer[] = [];
  freelancersRequests: freelancersRequest[] = [];
  unreadMessages: number = 0;

  // ---- UI state ----
  editMode = false;
  activeTab: string = 'bio';
  isLoading = true;
  isSaving = false;

  get statusLabel(): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected',
      blocked: '🚫 Blocked'
    };
    return labels[this.profileStatus];
  }

  get pendingRequestsCount(): number {
    return this.freelancersRequests.filter(r => r.status === 'pending').length;
  }

  get openProjectsCount(): number {
    return this.projectOffers.filter(p => p.status === 'open').length;
  }

  constructor(
    private router: Router,
    private profileService: ClientProfileService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    console.log('CLIENT PROFILE PAGE LOADED');
    this.loadProfile();
  }

  // ---- Load from API ----
  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data: ClientProfile) => {
        console.log('CLIENT PROFILE DATA:', data);
        
        // Profile data
        this.id = data.user.id;
        this.name = data.user.name;
        this.email = data.user.email;
        this.phone = data.user.phone || '';
        this.company = data.user.company || '';
        this.bio = data.user.bio || '';
        this.website = data.user.website || '';
        this.avatarUrl = data.user.avatar || 'assets/avatar.png';
        this.profileStatus = data.user.status;

        // Stats
        this.totalSpent = data.stats.totalSpent;
        this.activeProjects = data.stats.activeProjects;
        this.completedProjects = data.stats.completedProjects;
        this.freelancersRating = data.stats.freelancersRating;

        this.loadProjectOffers();
        this.loadfreelancersRequests();
        this.loadUnreadMessages();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.showToast('Error loading profile', 'danger');
        this.isLoading = false;
      }
    });
  }

  loadProjectOffers() {
    this.profileService.getProjectOffers().subscribe({
      next: (offers: ClientProjectOffer[]) => {
        console.log('PROJECT OFFERS:', offers);
        this.projectOffers = offers;
      },
      error: (err) => console.error('Error loading project offers:', err)
    });
  }

  loadfreelancersRequests() {
    this.profileService.getfreelancersRequests().subscribe({
      next: (requests: freelancersRequest[]) => {
        console.log('freelancers REQUESTS:', requests);
        this.freelancersRequests = requests;
      },
      error: (err) => console.error('Error loading freelancers requests:', err)
    });
  }

  loadUnreadMessages() {
    this.profileService.getUnreadMessageCount().subscribe({
      next: (data) => {
        this.unreadMessages = data.count;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages count:', err);
        this.isLoading = false;
      }
    });
  }

  // ---- Edit mode ----
  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    this.isSaving = true;
    const profileData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      website: this.website,
      bio: this.bio
    };

    this.profileService.updateProfile(profileData)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: (data) => {
          console.log('Profile updated:', data);
          this.editMode = false;
          this.showToast('Profile updated successfully', 'success');
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.showToast('Error updating profile', 'danger');
        }
      });
  }

  cancelEdit() {
    this.editMode = false;
    this.loadProfile();
  }

  // ---- Avatar upload ----
  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload to backend
      this.profileService.uploadAvatar(file).subscribe({
        next: (data) => {
          this.avatarUrl = data.avatar;
          this.showToast('Avatar updated', 'success');
        },
        error: (err) => {
          console.error('Error uploading avatar:', err);
          this.showToast('Error uploading avatar', 'danger');
        }
      });
    }
  }

  // ---- Project Offers Management ----
  createNewProject() {
    this.router.navigateByUrl('/create-project');
  }

  editProject(projectId: string) {
    this.router.navigateByUrl(`/edit-project/${projectId}`);
  }

  closeProject(project: ClientProjectOffer) {
    this.alertCtrl.create({
      header: 'Close Project',
      message: `Are you sure you want to close "${project.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Close',
          role: 'destructive',
          handler: () => {
            this.profileService.closeProjectOffer(project.id).subscribe({
              next: () => {
                this.showToast('Project closed', 'success');
                this.loadProjectOffers();
              },
              error: (err) => {
                console.error('Error closing project:', err);
                this.showToast('Error closing project', 'danger');
              }
            });
          }
        }
      ]
    }).then(alert => alert.present());
  }

  // ---- freelancers Requests Management ----
  acceptRequest(request: freelancersRequest) {
    this.profileService.acceptfreelancersRequest(request.id).subscribe({
      next: () => {
        this.showToast('Request accepted', 'success');
        this.loadfreelancersRequests();
      },
      error: (err) => {
        console.error('Error accepting request:', err);
        this.showToast('Error accepting request', 'danger');
      }
    });
  }

  rejectRequest(request: freelancersRequest) {
    this.alertCtrl.create({
      header: 'Reject Request',
      message: `Are you sure you want to reject ${request.freelancersName}'s request?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          role: 'destructive',
          handler: () => {
            this.profileService.rejectfreelancersRequest(request.id).subscribe({
              next: () => {
                this.showToast('Request rejected', 'success');
                this.loadfreelancersRequests();
              },
              error: (err) => {
                console.error('Error rejecting request:', err);
                this.showToast('Error rejecting request', 'danger');
              }
            });
          }
        }
      ]
    }).then(alert => alert.present());
  }

  viewfreelancersProfile(freelancersId: string) {
    this.router.navigateByUrl(`/view-freelancers-profile/${freelancersId}`);
  }

  // ---- Navigation ----
  goToMessages() {
    this.router.navigateByUrl('/conversations');
  }

  goToStore() {
    this.router.navigateByUrl('/store');
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  // ---- Helper ----
  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

