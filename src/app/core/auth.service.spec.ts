import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiConfigService } from './api-config.service';
import { AuthService } from './auth.service';
import { AuthTokenStore } from './auth-token.store';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockStore: {
    hasToken: ReturnType<typeof signal<boolean>>;
    getToken: () => string | null;
    clear: jasmine.Spy;
    setToken: jasmine.Spy;
  };

  beforeEach(() => {
    mockStore = {
      hasToken: signal(false),
      getToken: () => (mockStore.hasToken() ? 'test-token' : null),
      clear: jasmine.createSpy('clear').and.callFake(() => mockStore.hasToken.set(false)),
      setToken: jasmine.createSpy('setToken'),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiConfigService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthTokenStore, useValue: mockStore },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login posts username and password to auth/login', (done) => {
    service.login('user1', 'secret').subscribe((res) => {
      expect(res.token).toBe('tok-abc');
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'user1', password: 'secret' });
    req.flush({ token: 'tok-abc' });
  });

  it('logout does not call HTTP when there is no token', (done) => {
    mockStore.hasToken.set(false);
    service.logout().subscribe((v) => {
      expect(v).toBeNull();
      expect(mockStore.clear).not.toHaveBeenCalled();
      done();
    });
  });

  it('logout posts to auth/logout and clear runs in finalize', (done) => {
    mockStore.hasToken.set(true);
    service.logout().subscribe(() => {
      expect(mockStore.clear).toHaveBeenCalled();
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('/auth/logout/'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
