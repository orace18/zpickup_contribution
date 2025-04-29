import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgusComponent } from './private_polity.component';

describe('CgusComponent', () => {
  let component: CgusComponent;
  let fixture: ComponentFixture<CgusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CgusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CgusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
