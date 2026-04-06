import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PreferencesPage implements OnInit {
  readonly categories = this.preferencesService.availableCategories;
  selectedCategories = new Set<string>();

  constructor(
    private readonly router: Router,
    private readonly preferencesService: PreferencesService,
  ) {}

  ngOnInit(): void {
    const existing = this.preferencesService.getPreferences().categories;

    if (existing.length > 0) {
      this.selectedCategories = new Set(existing);
    }
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
      return;
    }

    this.selectedCategories.add(category);
  }

  get canContinue(): boolean {
    return this.selectedCategories.size > 0;
  }

  continueToHome(): void {
    if (!this.canContinue) {
      return;
    }

    this.preferencesService.savePreferences(Array.from(this.selectedCategories));
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
