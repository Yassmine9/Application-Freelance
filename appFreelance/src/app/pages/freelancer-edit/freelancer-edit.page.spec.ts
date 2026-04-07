import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FreelancerEditPage } from './freelancer-edit.page';

describe('FreelancerEditPage', () => {
  let component: FreelancerEditPage;
  let fixture: ComponentFixture<FreelancerEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FreelancerEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
