import { ComponentFixture, TestBed } from '@angular/core/testing';
import { freelancersEditPage } from './freelancers-edit.page';

describe('freelancersEditPage', () => {
  let component: freelancersEditPage;
  let fixture: ComponentFixture<freelancersEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(freelancersEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
