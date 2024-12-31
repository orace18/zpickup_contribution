import { TestBed } from '@angular/core/testing';

import { AssureursService } from './assureurs.service';

describe('AssureursService', () => {
  let service: AssureursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssureursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
