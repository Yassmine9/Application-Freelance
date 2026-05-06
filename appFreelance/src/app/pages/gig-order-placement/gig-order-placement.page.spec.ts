import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GigOrderPlacementPage } from './gig-order-placement.page';

describe('GigOrderPlacementPage', () => {
  let component: GigOrderPlacementPage;
  let fixture: ComponentFixture<GigOrderPlacementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GigOrderPlacementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
