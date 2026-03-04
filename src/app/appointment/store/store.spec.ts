import { TestBed } from '@angular/core/testing';

import { StoreService } from './store';

describe('Appointment', () => {
  let store: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });
});
