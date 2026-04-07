import { Component } from '@angular/core';

interface FreelancerCard {
  name: string;
  role: string;
  icon: string;
  rating: string;
  location: string;
}

@Component({
  selector: 'app-view-all-freelancers',
  templateUrl: './view-all-freelancers.page.html',
  styleUrls: ['./view-all-freelancers.page.scss'],
  standalone: false,
})
export class ViewAllFreelancersPage {
  readonly freelancers: FreelancerCard[] = [
    { name: 'Yassmine Abdelhak', role: 'Graphic Designer', icon: 'color-palette-outline', rating: '4.9', location: 'Tunis' },
    { name: 'Asma Abdedaiem', role: 'Digital Marketer', icon: 'megaphone-outline', rating: '4.8', location: 'Sfax' },
    { name: 'Sirine Saidi', role: 'Frontend Developer', icon: 'code-slash-outline', rating: '5.0', location: 'Sousse' },
    { name: 'Yasmine Srioui', role: 'Video Editor', icon: 'film-outline', rating: '4.7', location: 'Bizerte' },
    { name: 'Amira Ben Ali', role: 'Content Writer', icon: 'create-outline', rating: '4.9', location: 'Ariana' },
    { name: 'Meriem Trabelsi', role: 'UI / UX Designer', icon: 'phone-portrait-outline', rating: '4.8', location: 'Monastir' },
  ];

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
}
