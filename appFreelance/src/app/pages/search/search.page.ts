import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GigService } from '../../services/gig.service';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';

interface SearchResult {
  type: 'gig' | 'freelancer' | 'category';
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  image?: string;
  description?: string;
  rating?: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SideBarComponent],
})
export class SearchPage implements OnInit {
  searchQuery = '';
  searchResults: SearchResult[] = [];
  isLoading = false;
  hasSearched = false;
  activeTab: 'all' | 'gigs' | 'freelancers' | 'categories' = 'all';

  readonly categories = [
    { id: '1', title: 'Web Development', icon: 'code-slash-outline' },
    { id: '2', title: 'UI / UX Design', icon: 'phone-portrait-outline' },
    { id: '3', title: 'Mobile Development', icon: 'phone-portrait-outline' },
    { id: '4', title: 'SEO Optimization', icon: 'trending-up-outline' },
    { id: '5', title: 'Data Entry', icon: 'document-text-outline' },
    { id: '6', title: '3D Modeling', icon: 'cube-outline' },
    { id: '7', title: 'Cybersecurity', icon: 'shield-checkmark-outline' },
    { id: '8', title: 'AI Automation', icon: 'sparkles-outline' },
  ];

  constructor(
    private gigService: GigService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  onSearchInput(event: any): void {
    const query = (event.target?.value || '').toLowerCase().trim();
    this.searchQuery = query;

    if (!query) {
      this.searchResults = [];
      this.hasSearched = false;
      return;
    }

    this.performSearch(query);
  }

  performSearch(query: string): void {
    this.isLoading = true;
    this.hasSearched = true;

    // Simulate search results from different sources
    const allResults: SearchResult[] = [];

    // Search in categories
    const categoryResults = this.categories
      .filter(cat => cat.title.toLowerCase().includes(query))
      .map(cat => ({
        type: 'category' as const,
        id: cat.id,
        title: cat.title,
        icon: cat.icon,
      }));
    allResults.push(...categoryResults);

    // Search in gigs (mock data)
    const mockGigs = [
      {
        id: 'gig-1',
        title: 'Build a React Dashboard',
        subtitle: 'by John Dev',
        description: 'Professional React dashboard with charts',
        rating: 4.9,
      },
      {
        id: 'gig-2',
        title: 'Mobile App Development',
        subtitle: 'by Sarah Code',
        description: 'Full-stack mobile application development',
        rating: 4.8,
      },
      {
        id: 'gig-3',
        title: 'UI Design System',
        subtitle: 'by Mike Design',
        description: 'Complete design system for startups',
        rating: 5.0,
      },
      {
        id: 'gig-4',
        title: 'Backend API Design',
        subtitle: 'by Alex Backend',
        description: 'RESTful API with Node.js and MongoDB',
        rating: 4.7,
      },
    ];

    const gigResults = mockGigs
      .filter(gig => 
        gig.title.toLowerCase().includes(query) ||
        gig.subtitle?.toLowerCase().includes(query) ||
        gig.description?.toLowerCase().includes(query)
      )
      .map(gig => ({
        type: 'gig' as const,
        id: gig.id,
        title: gig.title,
        subtitle: gig.subtitle,
        description: gig.description,
        rating: gig.rating,
      }));
    allResults.push(...gigResults);

    // Search in freelancers (mock data)
    const mockFreelancers = [
      {
        id: 'freelancer-1',
        title: 'John Developer',
        subtitle: 'Full-Stack Developer',
        description: '10+ years experience with React & Node.js',
        rating: 4.9,
      },
      {
        id: 'freelancer-2',
        title: 'Sarah Designer',
        subtitle: 'UI/UX Designer',
        description: 'Specializing in mobile and web design',
        rating: 4.8,
      },
      {
        id: 'freelancer-3',
        title: 'Mike Specialist',
        subtitle: 'Digital Marketing Expert',
        description: 'SEO and content marketing specialist',
        rating: 5.0,
      },
    ];

    const freelancerResults = mockFreelancers
      .filter(freelancer =>
        freelancer.title.toLowerCase().includes(query) ||
        freelancer.subtitle?.toLowerCase().includes(query) ||
        freelancer.description?.toLowerCase().includes(query)
      )
      .map(freelancer => ({
        type: 'freelancer' as const,
        id: freelancer.id,
        title: freelancer.title,
        subtitle: freelancer.subtitle,
        description: freelancer.description,
        rating: freelancer.rating,
      }));
    allResults.push(...freelancerResults);

    this.searchResults = allResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    this.isLoading = false;
  }

  getFilteredResults(): SearchResult[] {
    if (this.activeTab === 'all') {
      return this.searchResults;
    }
    const typeMap: Record<string, string> = {
      gigs: 'gig',
      freelancers: 'freelancer',
      categories: 'category',
    };
    const resultType = typeMap[this.activeTab];
    return this.searchResults.filter(result => result.type === resultType);
  }

  setTab(tab: 'all' | 'gigs' | 'freelancers' | 'categories'): void {
    this.activeTab = tab;
  }

  navigateToResult(result: SearchResult): void {
    switch (result.type) {
      case 'gig':
        this.router.navigateByUrl(`/gig-detail/${result.id}`);
        break;
      case 'freelancer':
        this.router.navigateByUrl(`/freelancer-profile`);
        break;
      case 'category':
        this.router.navigateByUrl(`/view-all-services`);
        break;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.hasSearched = false;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
