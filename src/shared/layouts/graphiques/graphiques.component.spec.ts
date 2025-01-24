import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphiquesComponent } from './graphiques.component';

describe('GraphiquesComponent', () => {
  let component: GraphiquesComponent;
  let fixture: ComponentFixture<GraphiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
