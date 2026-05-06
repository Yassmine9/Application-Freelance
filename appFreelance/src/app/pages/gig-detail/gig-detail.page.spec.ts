import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GigDetailPage } from './gig-detail.page';

describe('GigDetailPage', () => {
  let component: GigDetailPage;
  let fixture: ComponentFixture<GigDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GigDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
