import { TestBed, inject } from '@angular/core/testing';

import { SideBareService } from './side-bare.service';

describe('SideBareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SideBareService]
    });
  });

  it('should be created', inject([SideBareService], (service: SideBareService) => {
    expect(service).toBeTruthy();
  }));
});
