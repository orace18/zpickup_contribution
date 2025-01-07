import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharteTestComponent } from './charte-test.component';

describe('ChartTestComponent', () => {
  let component: CharteTestComponent;
  let fixture: ComponentFixture<CharteTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharteTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharteTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
