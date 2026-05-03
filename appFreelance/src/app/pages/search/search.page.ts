import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { GigService } from '../../services/gig.service';
import { ToolBarComponent } from '../../components/Tool-bar/toolbar.component';
import { environment } from '../../../environments/environment';

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
  imports: [IonicModule, CommonModule, FormsModule, ToolBarComponent],
})
export class SearchPage implements OnInit {
  searchQuery = '';
  searchResults: SearchResult[] = [];
  isLoading = false;
  hasSearched = false;
  activeTab: 'all' | 'gigs' | 'freelancers' | 'categories' = 'all';
  private readonly apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
  private categories: Array<{ id: string; title: string; icon: string }> = [];
  private gigs: any[] = [];
  private freelancers: any[] = [];

  constructor(
    private gigService: GigService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSearchSources();
  }

  private loadSearchSources(): void {
    forkJoin({
      gigs: this.gigService.getAllGigs(),
      freelancers: this.http.get<any>(`${environment.apiUrl}/auth/freelancers?status=all`),
      categories: this.http.get<any[]>(`${this.apiRoot}/categories/`),
    }).subscribe({
      next: ({ gigs, freelancers, categories }) => {
        this.gigs = gigs || [];
        this.freelancers = Array.isArray(freelancers) ? freelancers : (freelancers?.freelancers ?? []);
        this.categories = (categories || []).map((category: any, index: number) => ({
          id: category?._id || String(index),
          title: (category?.name || '').trim(),
          icon: this.iconForCategory(category?.name || category?.type || ''),
        })).filter((category) => !!category.title);
      },
      error: () => {
        this.gigs = [];
        this.freelancers = [];
        this.categories = [];
      },
    });
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

    const allResults: SearchResult[] = [];

    const categoryResults = this.categories
      .filter(cat => cat.title.toLowerCase().includes(query))
      .map(cat => ({
        type: 'category' as const,
        id: cat.id,
        title: cat.title,
        icon: cat.icon,
      }));
    allResults.push(...categoryResults);

    const gigResults = this.gigs
      .filter(gig => 
        (gig.title || '').toLowerCase().includes(query) ||
        (gig.freelancer_name || '').toLowerCase().includes(query) ||
        (gig.description || '').toLowerCase().includes(query) ||
        (Array.isArray(gig.tags) ? gig.tags.join(' ') : String(gig.tags || '')).toLowerCase().includes(query)
      )
      .map(gig => ({
        type: 'gig' as const,
        id: gig._id,
        title: gig.title,
        subtitle: gig.freelancer_name ? `by ${gig.freelancer_name}` : undefined,
        description: gig.description,
        rating: Number(gig.rating || 0),
      }));
    allResults.push(...gigResults);

    const freelancerResults = this.freelancers
      .filter(freelancer =>
        (freelancer.name || '').toLowerCase().includes(query) ||
        (Array.isArray(freelancer.skills) ? freelancer.skills.join(' ') : '').toLowerCase().includes(query) ||
        (freelancer.bio || '').toLowerCase().includes(query)
      )
      .map(freelancer => ({
        type: 'freelancer' as const,
        id: freelancer._id,
        title: freelancer.name,
        subtitle: Array.isArray(freelancer.skills) ? freelancer.skills.slice(0, 2).join(', ') : '',
        description: freelancer.bio || 'Freelancer profile',
        rating: Number(freelancer.client_rating || 0),
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
        this.router.navigateByUrl(`/view-freelancer-profile/${result.id}`);
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

  private iconForCategory(category: string): string {
    const label = (category || '').toLowerCase();
    if (label.includes('design')) return 'color-palette-outline';
    if (label.includes('web') || label.includes('dev')) return 'code-slash-outline';
    if (label.includes('mobile')) return 'phone-portrait-outline';
    if (label.includes('marketing')) return 'megaphone-outline';
    if (label.includes('seo')) return 'trending-up-outline';
    if (label.includes('data')) return 'document-text-outline';
    if (label.includes('cyber')) return 'shield-checkmark-outline';
    if (label.includes('ai')) return 'sparkles-outline';
    return 'layers-outline';
  }
}
