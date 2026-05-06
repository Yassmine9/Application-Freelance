import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminOffersPage } from './admin-offers.page';

describe('AdminOffersPage', () => {
  let component: AdminOffersPage;
  let fixture: ComponentFixture<AdminOffersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminOffersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
