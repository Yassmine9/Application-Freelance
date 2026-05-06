import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPurchasesPage } from './admin-purchases.page';

describe('AdminPurchasesPage', () => {
  let component: AdminPurchasesPage;
  let fixture: ComponentFixture<AdminPurchasesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPurchasesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
