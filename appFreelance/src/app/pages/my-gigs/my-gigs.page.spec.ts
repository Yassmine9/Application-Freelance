import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyGigsPage } from './my-gigs.page';

describe('MyGigsPage', () => {
  let component: MyGigsPage;
  let fixture: ComponentFixture<MyGigsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyGigsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});