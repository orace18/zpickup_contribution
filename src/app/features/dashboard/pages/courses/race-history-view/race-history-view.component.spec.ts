import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceHistoryViewComponent } from './race-history-view.component';

describe('RaceHistoryViewComponent', () => {
  let component: RaceHistoryViewComponent;
  let fixture: ComponentFixture<RaceHistoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceHistoryViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaceHistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
