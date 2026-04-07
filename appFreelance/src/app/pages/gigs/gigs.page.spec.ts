import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GigsPage } from './gigs.page';

describe('GigsPage', () => {
  let component: GigsPage;
  let fixture: ComponentFixture<GigsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GigsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
