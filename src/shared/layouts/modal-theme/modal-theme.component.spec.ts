import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalThemeComponent } from './modal-theme.component';

describe('ModalThemeComponent', () => {
  let component: ModalThemeComponent;
  let fixture: ComponentFixture<ModalThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalThemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
