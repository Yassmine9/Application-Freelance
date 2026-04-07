import { Component } from '@angular/core';

interface ServiceCard {
  title: string;
  description: string;
  icon: string;
  timeline: string;
  price: string;
}

@Component({
  selector: 'app-view-all-services',
  templateUrl: './view-all-services.page.html',
  styleUrls: ['./view-all-services.page.scss'],
  standalone: false,
})
export class ViewAllServicesPage {
  readonly services: ServiceCard[] = [
    { title: 'Graphic Design', description: 'Brand kits, social media visuals, and presentation decks.', icon: 'color-palette-outline', timeline: '3-5 days', price: 'From $120' },
    { title: 'Digital Marketing', description: 'Campaign planning, content calendars, and paid ads setup.', icon: 'megaphone-outline', timeline: '1 week', price: 'From $180' },
    { title: 'Web Development', description: 'Fast, responsive front-end builds for landing pages and apps.', icon: 'code-slash-outline', timeline: '1-2 weeks', price: 'From $300' },
    { title: 'Video Editing', description: 'Short-form edits, ads, and polished promo reels.', icon: 'film-outline', timeline: '2-4 days', price: 'From $140' },
    { title: 'Content Writing', description: 'Landing page copy, blog articles, and conversion-focused text.', icon: 'create-outline', timeline: '2-3 days', price: 'From $100' },
    { title: 'UI / UX Design', description: 'Product flows, wireframes, and interface systems.', icon: 'phone-portrait-outline', timeline: '4-7 days', price: 'From $220' },
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
