import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGigsPage } from './admin-gigs.page';

describe('AdminGigsPage', () => {
  let component: AdminGigsPage;
  let fixture: ComponentFixture<AdminGigsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminGigsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
