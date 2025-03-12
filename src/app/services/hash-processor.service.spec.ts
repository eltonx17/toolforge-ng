import { TestBed } from '@angular/core/testing';

import { HashProcessorService } from './hash-processor.service';

describe('HashProcessorService', () => {
  let service: HashProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
