import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatebuttonComponent } from './animatebutton.component';

describe('AnimatebuttonComponent', () => {
  let component: AnimatebuttonComponent;
  let fixture: ComponentFixture<AnimatebuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatebuttonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatebuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
