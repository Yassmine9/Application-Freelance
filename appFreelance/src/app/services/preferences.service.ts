import { Injectable } from '@angular/core';

export interface UserPreferences {
  categories: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly storageKey = 'user_preferences';

  readonly availableCategories: string[] = [
    'Graphic Design',
    'Digital Marketing',
    'Web Development',
    'Video Editing',
    'Content Writing',
    'UI / UX Design',
    'Mobile Development',
    'SEO Optimization',
    'Translation',
    'Social Media Management',
    'Data Entry',
    'Voice Over',
    'Photography',
    '3D Modeling',
    'Cybersecurity',
    'AI Automation',
  ];

  hasPreferences(): boolean {
    const prefs = this.getPreferences();
    return prefs.categories.length > 0;
  }

  getPreferences(): UserPreferences {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return { categories: [] };
    }

    try {
      const parsed = JSON.parse(raw) as UserPreferences;
      if (!Array.isArray(parsed.categories)) {
        return { categories: [] };
      }
      return {
        categories: parsed.categories.filter((category) => typeof category === 'string'),
      };
    } catch {
      return { categories: [] };
    }
  }

  savePreferences(categories: string[]): void {
    const payload: UserPreferences = {
      categories: categories.filter(Boolean),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  clearPreferences(): void {
    localStorage.removeItem(this.storageKey);
  }
}
