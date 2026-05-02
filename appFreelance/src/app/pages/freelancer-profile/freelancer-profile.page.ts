import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { freelancersProfileService } from '../../services/freelancer-profile.service';
import { Router } from '@angular/router';

export interface Project {
  title: string;
  description: string;
  link: string;
}
export interface Gig {
  title :string;
}

export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked';

@Component({
  selector: 'app-freelancers-profile',
  templateUrl: './freelancer-profile.page.html',
  styleUrls: ['./freelancer-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class freelancersProfilePage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // ---- Profile fields ----
  id : string ='';
  name: string = '';
  email: string = '';
  phone: string = '';
  title: string = '';
  bio: string = '';
  skills: string = '';
  skillList: string[] = [];
  hourlyRate: number = 0;
  experienceYears: number = 0;
  projectsCompleted: number = 0;
  clientRating: number = 0;
  successRate: number = 0;
  cvName: string = '';
  cvFile: File | null = null;
  avatarFile: File | null = null;
  avatarUrl: string = 'assets/avatar.png';
  projects: Project[] = [];
  profileStatus: ProfileStatus = 'draft';
  gigs : Gig[] = [];
  // ---- UI state ----
  editMode = false;
  activeTab: string = 'bio';
  isLoading = true;
  original_cv_name: string ="" ;

  get isTopRated(): boolean {
    return this.successRate >= 90;
  }

  get statusLabel(): string {
    const labels: Record<ProfileStatus, string> = {
      draft: 'Draft',
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected',
      blocked: '🚫 Blocked'
    };
    return labels[this.profileStatus];
  }

  constructor(private profileService: freelancersProfileService,private router:Router) {}
   
  ngOnInit() {
    console.log('PAGE LOADED - name is:', this.name);
    
    this.loadProfile();
  }

  // ---- Load from API ----
  loadProfile() {
  this.isLoading = true;
  console.log("inside the load profile");
  this.profileService.getProfile().subscribe({
    next: (data: any) => {
      console.log('DATA FROM API:', data);
      
      this.id = data.user.id
      this.name              = data.user.name;
      this.email             = data.user.email || '';
      this.phone             = data.user.phone || '';
      this.title             = data.user.title || '';
      this.bio               = data.user.bio || '';
      this.skillList         = data.user.skills || [];
      this.skills            = (data.user.skills || []).join(', ');
      this.hourlyRate        = data.user.hourly_rate || 0;
      this.experienceYears   = data.user.experience_years || 0;
      this.projectsCompleted = data.user.projects_completed || 0;
      this.clientRating      = data.user.client_rating || 0;
      this.successRate       = data.user.success_rate || 0;
      this.cvName            = data.user.cv_filename || '';
      this.projects          = data.user.portfolio || [];
      this.original_cv_name = this.name.concat("_cv")
      this.gigs = (data.user.gigs || [])
        .filter((g: Gig[] | null): g is Gig[] => g != null)
        .flat();
      this.profileStatus     = data.user.status || 'draft';
      
      if (data.user.avatar_filename) {
        this.avatarUrl = `http://127.0.0.1:5000/api/uploads/avatars/${data.user.avatar_filename}`;
      }
      else {
      this.avatarUrl = 'appFreelance/src/assets/avatar.png';
       }
      this.isLoading = false;
      
    },
    error: (err: any) => {
      console.error('Failed to load profile', err);
      this.isLoading = false;
    }
  });
}
  // ---- Tab navigation ----
  async setTab(tab: string) {
    this.activeTab = tab;
    const scrollEl = await this.content.getScrollElement();
    const target = document.getElementById(tab);
    if (target) {
      scrollEl.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
    }
  }

  // ---- Edit mode ----
  toggleEdit() {
    //this.editMode = !this.editMode;
     this.router.navigate(['/freelancers-edit']);
  }

  // ---- CV ----
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cvFile = file;
      this.cvName = file.name;
    }
  }

  removeCV() {
    this.cvFile = null;
    this.cvName = '';
  }

  // ---- Avatar ----
  onAvatarSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  // ---- Portfolio ----
  addProject() {
    this.projects.push({ title: '', description: '', link: '' });
  }



  removeProject(index: number) {
    this.projects.splice(index, 1);
  }
getmygigs() {
  this.router.navigate(['/my-gigs']);
}
  // ---- Save ----
  saveProfile() {
    this.skillList = this.skills.split(',').map(s => s.trim()).filter(s => s);
    this.projects  = this.projects.filter(p => p.title.trim() !== '');

    const payload = {
      title:              this.title,
      bio:                this.bio,
      skills:             this.skillList,
      hourly_rate:        this.hourlyRate,
      phone:              this.phone,
      experience_years:   this.experienceYears,
      projects_completed: this.projectsCompleted,
      portfolio:          this.projects
    };

    this.profileService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.profileStatus = res.status;
        this.editMode = false;
        console.log('Profile saved');
      },
      error: (err: any) => console.error('Failed to save profile', err)
    });

    // upload CV if new file selected
    if (this.cvFile) {
      this.profileService.uploadCV(this.cvFile).subscribe({
        next: (res: any) => this.cvName = res.cv_filename,
        error: (err: any) => console.error('CV upload failed', err)
      });
    }

    // upload avatar if new file selected
    if (this.avatarFile) {
      this.profileService.uploadAvatar(this.avatarFile).subscribe({
        next: (res: any) => console.log('Avatar uploaded', res),
        error: (err: any) => console.error('Avatar upload failed', err)
      });
    }
  }
}