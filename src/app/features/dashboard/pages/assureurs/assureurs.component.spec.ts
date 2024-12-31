import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssureursComponent } from './assureurs.component';

describe('AssureursComponent', () => {
  let component: AssureursComponent;
  let fixture: ComponentFixture<AssureursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssureursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssureursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
