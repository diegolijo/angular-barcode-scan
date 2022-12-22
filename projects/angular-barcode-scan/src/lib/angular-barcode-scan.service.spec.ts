import { TestBed } from '@angular/core/testing';

import { BarcodeScan } from './angular-barcode-scan.service';

describe('BarcodeScan', () => {
  let service: BarcodeScan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BarcodeScan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
