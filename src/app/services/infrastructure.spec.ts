import { TestBed } from '@angular/core/testing';

import { InfrastructureService } from './infrastructure';

describe('Infrastructure', () => {
  let service: InfrastructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
