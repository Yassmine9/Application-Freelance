import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface CacheEntry {
  data: any[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  private categoriesCache: CacheEntry | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  /**
   * Get categories from cache or backend
   * @param useCache Whether to use cached data (default: true)
   * @returns Observable of categories array
   */
  getCategories(useCache = true): Observable<any[]> {
    // Check if cache is still valid
    if (useCache && this.categoriesCache) {
      const age = Date.now() - this.categoriesCache.timestamp;
      if (age < this.CACHE_TTL) {
        return of(this.categoriesCache.data);
      }
    }

    // Fetch fresh data from backend
    return this.http.get<any[]>(`${this.apiUrl}/categories/`).pipe(
      tap((data) => {
        this.categoriesCache = { data, timestamp: Date.now() };
      })
    );
  }

  /**
   * Clear the categories cache
   */
  clearCache(): void {
    this.categoriesCache = null;
  }
}
