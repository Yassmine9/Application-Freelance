import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminReviewsPage } from './admin-reviews.page';

describe('AdminReviewsPage', () => {
  let component: AdminReviewsPage;
  let fixture: ComponentFixture<AdminReviewsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
