import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { WhatsappService } from './whatsapp';

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WhatsappService);
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });
});
