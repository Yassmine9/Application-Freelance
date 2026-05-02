import { ComponentFixture, TestBed } from '@angular/core/testing';
import { freelancersProfilePage } from './freelancers-profile.page';

describe('freelancersProfilePage', () => {
  let component: freelancersProfilePage;
  let fixture: ComponentFixture<freelancersProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(freelancersProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
