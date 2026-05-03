import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';
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
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class FreelancerEditPage implements OnInit {

  // Profile fields
  name = '';
  title = '';
  bio = '';
  skills = '';
  skillList: string[] = [];
  hourlyRate = 0;
  experienceYears = 0;
  projectsCompleted = 0;
  clientRating = 0;
  successRate = 0;
  cvName = '';
  cvFile: File | null = null;
  avatarFile: File | null = null;
  avatarUrl = 'assets/avatar.png';
  projects: Project[] = [];

  constructor(
    private profileService: FreelancerProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.name = data.user.name || '';
        this.title = data.user.title || '';
        this.bio = data.user.bio || '';
        this.skillList = data.user.skills || [];
        this.skills = this.skillList.join(', ');
        this.hourlyRate = data.user.hourly_rate || 0;
        this.experienceYears = data.user.experience_years || 0;
        this.projectsCompleted = data.user.projects_completed || 0;
        this.clientRating = data.user.client_rating || 0;
        this.successRate = data.user.success_rate || 0;
        this.cvName = data.user.cv_filename || '';
        this.projects = data.user.portfolio || [];

        if (data.user.avatar_filename) {
          this.avatarUrl = `${environment.apiUrl}/uploads/avatars/${data.user.avatar_filename}`;
        }
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  onAvatarSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

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

  addProject() {
    this.projects.push({ title: '', description: '', link: '' });
  }

  removeProject(index: number) {
    this.projects.splice(index, 1);
  }

  saveProfile() {
    this.skillList = this.skills.split(',').map(s => s.trim()).filter(s => s);
    this.projects = this.projects.filter(p => p.title.trim() !== '');

    const payload = {
      title: this.title,
      bio: this.bio,
      skills: this.skillList,
      hourly_rate: this.hourlyRate,
      experience_years: this.experienceYears,
      projects_completed: this.projectsCompleted,
      success_rate: this.successRate,
      portfolio: this.projects
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        // Upload CV if changed
        if (this.cvFile) {
          this.profileService.uploadCV(this.cvFile).subscribe();
        }
        // Upload avatar if changed
        if (this.avatarFile) {
          this.profileService.uploadAvatar(this.avatarFile).subscribe();
        }
        // Go back to profile view
        this.router.navigate(['/freelancer-profile']);
      },
      error: (err) => console.error('Failed to save profile', err)
    });
  }
}