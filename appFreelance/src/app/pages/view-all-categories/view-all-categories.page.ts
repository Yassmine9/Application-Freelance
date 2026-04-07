import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface ServiceCategory {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-view-all-categories',
  templateUrl: './view-all-categories.page.html',
  styleUrls: ['./view-all-categories.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ViewAllCategoriesPage {
  readonly categories: ServiceCategory[] = [
    { title: 'Graphic Design', icon: 'color-palette-outline' },
    { title: 'Digital Marketing', icon: 'megaphone-outline' },
    { title: 'Web Development', icon: 'code-slash-outline' },
    { title: 'Video Editing', icon: 'film-outline' },
    { title: 'Content Writing', icon: 'create-outline' },
    { title: 'UI / UX Design', icon: 'phone-portrait-outline' },
    { title: 'Mobile Development', icon: 'phone-portrait-outline' },
    { title: 'SEO Optimization', icon: 'trending-up-outline' },
    { title: 'Translation', icon: 'language-outline' },
    { title: 'Social Media', icon: 'people-circle-outline' },
    { title: 'Data Entry', icon: 'document-text-outline' },
    { title: 'Voice Over', icon: 'mic-outline' },
  ];

  constructor() {}

  trackByIndex(index: number): number {
    return index;
  }

}
