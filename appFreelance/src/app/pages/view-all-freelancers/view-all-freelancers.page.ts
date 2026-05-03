import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface FreelancerCard {
  id: string;
  name: string;
  primarySkill: string;
  skills: string[];
  icon: string;
  rating: number;
  location: string;
}

interface FreelancerApiItem {
  _id: string;
  name?: string;
  skills?: string[];
  hourly_rate?: number;
}

type FreelancersApiResponse = FreelancerApiItem[] | { freelancers?: FreelancerApiItem[] };

@Component({
  selector: 'app-view-all-freelancers',
  templateUrl: './view-all-freelancers.page.html',
  styleUrls: ['./view-all-freelancers.page.scss'],
  standalone: false,
})
export class ViewAllFreelancersPage {
  freelancers: FreelancerCard[] = [];
  isLoading = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  ionViewWillEnter(): void {
    this.loadFreelancers();
  }

  private loadFreelancers(): void {
    this.isLoading = true;

    this.http.get<FreelancersApiResponse>(`${environment.apiUrl}/auth/freelancers?status=all`).subscribe({
      next: (response) => {
        const rawFreelancers = Array.isArray(response) ? response : (response.freelancers ?? []);
        this.freelancers = rawFreelancers
          .map((freelancer) => this.mapFreelancer(freelancer))
          .filter((freelancer): freelancer is FreelancerCard => freelancer !== null);
        this.isLoading = false;
      },
      error: () => {
        this.freelancers = [];
        this.isLoading = false;
      },
    });
  }

  private mapFreelancer(freelancer: FreelancerApiItem): FreelancerCard | null {
    const name = freelancer.name?.trim();

    if (!name) {
      return null;
    }

    const normalizedSkills = (freelancer.skills ?? [])
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const skills = normalizedSkills.length > 0 ? normalizedSkills : ['Freelancer'];
    const primarySkill = skills[0];

    return {
      id: freelancer._id,
      name,
      primarySkill,
      skills,
      icon: this.iconForRole(primarySkill),
      rating: this.ratingFromRate(freelancer.hourly_rate),
      location: 'Tunisia',
    };
  }

  private iconForRole(role: string): string {
    const label = role.toLowerCase();

    if (label.includes('design')) return 'color-palette-outline';
    if (label.includes('market')) return 'megaphone-outline';
    if (label.includes('web') || label.includes('dev')) return 'code-slash-outline';
    if (label.includes('video')) return 'film-outline';
    if (label.includes('content') || label.includes('writing')) return 'create-outline';
    if (label.includes('ui') || label.includes('ux')) return 'phone-portrait-outline';

    return 'person-outline';
  }

  private ratingFromRate(rate?: number): number {
    if (!rate || rate <= 0) {
      return 4.8;
    }

    if (rate >= 80) return 5.0;
    if (rate >= 50) return 4.9;
    if (rate >= 30) return 4.8;

    return 4.7;
  }

  get averageRating(): string {
    if (this.freelancers.length === 0) {
      return '0.0';
    }

    const total = this.freelancers.reduce((sum, freelancer) => sum + freelancer.rating, 0);
    return (total / this.freelancers.length).toFixed(1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  getAccentClass(index: number): string {
    return `accent-${(index % 6) + 1}`;
  }

  navigateToFreelancerProfile(freelancerId: string): void {
    this.router.navigateByUrl(`/view-freelancer-profile/${freelancerId}`);
  }
}
