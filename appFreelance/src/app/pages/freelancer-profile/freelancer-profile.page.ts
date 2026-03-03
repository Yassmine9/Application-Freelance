import { Component, OnInit,ViewChild } from '@angular/core';
import { IonicModule ,IonContent} from '@ionic/angular';   // ✅ Must import IonicModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface Project {
  title: string;
  description: string;
  link: string;
}

export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected';
@Component({
  selector: 'app-freelancer-profile',
  templateUrl: './freelancer-profile.page.html',
  styleUrls: ['./freelancer-profile.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class FreelancerProfilePage implements OnInit {

@ViewChild(IonContent, { static: false }) content!: IonContent;

  // ---- Profile fields ----
  bio: string = 'I am a passionate web developer specialized in Angular.';
  skills: string = 'Angular,Ionic,Node';
  skillList: string[] = [];
  cvName: string = 'freelancer_cv.pdf';
  cvFile: File | null = null;

  // ---- Portfolio: list of past projects ----
  projects: Project[] = [
    {
      title: 'E-commerce App',
      description: 'A full-stack shopping app built with Angular and Node.js.',
      link: 'https://myproject.com'
    }
  ];

  // ---- UI state ----
  editMode = false;
  activeTab: string = 'bio';

  // ---- Profile status: draft → pending → approved / rejected ----
  profileStatus: ProfileStatus = 'draft';

  get statusLabel(): string {
    const labels: Record<ProfileStatus, string> = {
      draft: 'Draft',
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    };
    return labels[this.profileStatus];
  }

  ngOnInit() {
    this.skillList = this.skills.split(',').map(s => s.trim());
  }

  // ---- Tab navigation — scrolls to section ----
  async setTab(tab: string) {
    this.activeTab = tab;
    const scrollEl = await this.content.getScrollElement();
    const target = document.getElementById(tab);
    if (target) {
      const offset = target.offsetTop;
      scrollEl.scrollTo({ top: offset - 60, behavior: 'smooth' });
    }
  }

  // ---- Edit mode ----
  toggleEdit() {
    this.editMode = !this.editMode;
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

  // ---- Portfolio projects ----
  addProject() {
    this.projects.push({ title: '', description: '', link: '' });
  }

  removeProject(index: number) {
    this.projects.splice(index, 1);
  }

  // ---- Save ----
  saveProfile() {
    this.skillList = this.skills.split(',').map(s => s.trim()).filter(s => s);
    
    // Remove empty projects
    this.projects = this.projects.filter(p => p.title.trim() !== '');
    this.editMode = false;
    console.log('Profile saved');
  }

 

  // ---- Called by Admin (example) ----
  approveProfile() {
    this.profileStatus = 'approved';
  }

  rejectProfile() {
    this.profileStatus = 'rejected';
  }
}


