import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { environment } from '../../../environments/environment';

export interface Project {
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-freelancer-edit',
  templateUrl: './freelancer-edit.page.html',
  styleUrls: ['./freelancer-edit.page.scss'],
  imports : [IonicModule,FormsModule,CommonModule],
})
export class FreelancerEditPage implements OnInit {

  // ── Profile fields ───────────────────────────────────────
  title: string = '';
  bio: string = '';
  skills: string = '';               // comma separated string for input
  skillList: string[] = [];          // actual array sent to backend
  hourlyRate: number = 0;
  phone: string = '';
  experienceYears: number = 0;
  projectsCompleted: number = 0;
  portfolio: Project[] = [];

  // ── File fields ──────────────────────────────────────────
  avatarUrl: string = 'assets/avatar.png';
  avatarFile: File | null = null;
  cvName: string = '';
  cvFile: File | null = null;

  // ── UI state ─────────────────────────────────────────────
  isLoading = true;
  isSaving = false;

  constructor(
    private profileService: FreelancerProfileService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  // ── Load current profile data ────────────────────────────
  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        const u = data.user;
        this.title           = u.title || '';
        this.bio             = u.bio || '';
        this.skillList       = u.skills || [];
        this.skills          = (u.skills || []).join(', ');
        this.hourlyRate      = u.hourly_rate || 0;
        this.phone           = u.phone || '';
        this.experienceYears = u.experience_years || 0;
        this.projectsCompleted = u.projects_completed || 0;
        this.portfolio       = u.portfolio || [];
        this.cvName          = u.cv_filename || '';
        if (u.avatar_filename) {
          this.avatarUrl = `${environment.apiUrl}/uploads/avatars/${u.avatar_filename}`;
        }
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Failed to load profile', 'danger');
        this.isLoading = false;
      }
    });
  }

  // ── Avatar ───────────────────────────────────────────────
  onAvatarSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      // preview immediately
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  // ── CV ───────────────────────────────────────────────────
  onCvSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cvFile = file;
      this.cvName = file.name;
    }
  }

  removeCv() {
    this.cvFile = null;
    this.cvName = '';
  }

  // ── Portfolio ────────────────────────────────────────────
  addProject() {
    this.portfolio.push({ title: '', description: '', link: '' });
  }

  removeProject(index: number) {
    this.portfolio.splice(index, 1);
  }

  // ── Save ─────────────────────────────────────────────────
  async saveProfile() {
    this.isSaving = true;

    // convert skills string to array
    this.skillList = this.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    // remove empty portfolio entries
    const cleanPortfolio = this.portfolio.filter(p => p.title.trim() !== '');

    const payload = {
      title:               this.title,
      bio:                 this.bio,
      skills:              this.skillList,
      hourly_rate:         this.hourlyRate,
      phone:               this.phone,
      experience_years:    this.experienceYears,
      projects_completed:  this.projectsCompleted,
      portfolio:           cleanPortfolio
    };

    // 1 — update profile fields
    this.profileService.updateProfile(payload).subscribe({
      next: async () => {

        // 2 — upload avatar if changed
        if (this.avatarFile) {
          this.profileService.uploadAvatar(this.avatarFile).subscribe({
            error: () => this.showToast('Avatar upload failed', 'warning')
          });
        }

        // 3 — upload cv if changed
        if (this.cvFile) {
          this.profileService.uploadCV(this.cvFile).subscribe({
            next: (res) => this.cvName = res.cv_filename,
            error: () => this.showToast('CV upload failed', 'warning')
          });
        }

        this.isSaving = false;
        await this.showToast('Profile updated successfully', 'success');
        this.router.navigate(['/freelancer-profile']);  // go back to profile
      },
      error: async () => {
        this.isSaving = false;
        await this.showToast('Failed to update profile', 'danger');
      }
    });
  }

  // ── Helper ───────────────────────────────────────────────
  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/freelancer-profile']);
  }
}