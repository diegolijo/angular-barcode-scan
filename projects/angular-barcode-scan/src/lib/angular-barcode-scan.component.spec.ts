import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeHostListener } from './angular-barcode-scan.component';

describe('BarcodeHostListener', () => {
  let component: BarcodeHostListener;
  let fixture: ComponentFixture<BarcodeHostListener>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarcodeHostListener ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarcodeHostListener);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
