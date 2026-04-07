import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewAllCategoriesPage } from './view-all-categories.page';

describe('ViewAllCategoriesPage', () => {
  let component: ViewAllCategoriesPage;
  let fixture: ComponentFixture<ViewAllCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
