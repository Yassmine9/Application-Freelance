import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFeedbackPage } from './admin-feedback.page';

describe('AdminFeedbackPage', () => {
  let component: AdminFeedbackPage;
  let fixture: ComponentFixture<AdminFeedbackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedbackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
