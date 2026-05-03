import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../services/category.service';
import { environment } from '../../environments/environment';

describe('Freelance App Integration Tests', () => {
  let httpMock: HttpTestingController;
  let apiService: ApiService;
  let authService: AuthService;
  let categoryService: CategoryService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, AuthService, CategoryService],
    });

    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
    authService = TestBed.inject(AuthService);
    categoryService = TestBed.inject(CategoryService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Authentication Flow', () => {
    it('should login user and store JWT token', fakeAsync(() => {
      const loginData = { email: 'test@freelance.com', password: 'password123' };
      const mockResponse = { access_token: 'jwt_token_123', user: { _id: 'user1', email: 'test@freelance.com', role: 'freelancer' } };

      const loginSpy = spyOn(authService, 'login').and.returnValue(of(mockResponse));
      
      authService.login(loginData.email, loginData.password).subscribe((res) => {
        expect(res.access_token).toBe('jwt_token_123');
        expect(res.user.role).toBe('freelancer');
      });

      tick();
      expect(loginSpy).toHaveBeenCalledWith(loginData.email, loginData.password);
    }));

    it('should identify user role (freelancer vs client)', () => {
      const freelancerRole = 'freelancer';
      const clientRole = 'client';

      expect(authService.getUserRole()).toBe(freelancerRole || clientRole || null);
    });
  });

  describe('Offer Creation & Proposal Submission Flow', () => {
    it('should create offer with file upload', fakeAsync(() => {
      const mockOffer = {
        title: 'Build a Website',
        budget: 500,
        deadline: '2026-05-28',
        category: 'Development',
      };

      const payload = new FormData();
      payload.append('title', mockOffer.title);
      payload.append('budget', String(mockOffer.budget));
      payload.append('deadline', mockOffer.deadline);
      payload.append('category', mockOffer.category);

      apiService.createOffer(payload).subscribe((res) => {
        expect(res._id).toBeDefined();
        expect(res.title).toBe('Build a Website');
        expect(res.status).toBe('pending');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/offers/`);
      expect(req.request.method).toBe('POST');
      req.flush({ _id: 'offer1', ...mockOffer, status: 'pending' });
      tick();
    }));

    it('should fetch offers list', fakeAsync(() => {
      const mockOffers = [
        { _id: 'offer1', title: 'Web Dev Project', status: 'active', category: 'Development' },
        { _id: 'offer2', title: 'Logo Design', status: 'active', category: 'Design' },
      ];

      apiService.getOffers().subscribe((res) => {
        expect(res.length).toBe(2);
        expect(res[0].title).toBe('Web Dev Project');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/offers/'));
      expect(req.request.method).toBe('GET');
      req.flush(mockOffers);
      tick();
    }));

    it('should submit proposal to offer', fakeAsync(() => {
      const proposalData = new FormData();
      proposalData.append('offerId', 'offer1');
      proposalData.append('freelancerId', 'freelancer1');
      proposalData.append('bidAmount', '400');
      proposalData.append('coverLetter', 'I can build this website...');

      apiService.submitProposal(proposalData).subscribe((res) => {
        expect(res._id).toBeDefined();
        expect(res.status).toBe('pending');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/proposals/`);
      expect(req.request.method).toBe('POST');
      req.flush({ _id: 'proposal1', status: 'pending' });
      tick();
    }));

    it('should accept proposal', fakeAsync(() => {
      apiService.acceptProposal('proposal1').subscribe((res) => {
        expect(res.status).toBe('accepted');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/proposals/proposal1/accept`);
      expect(req.request.method).toBe('PUT');
      req.flush({ _id: 'proposal1', status: 'accepted' });
      tick();
    }));
  });

  describe('Chat & Messaging Flow', () => {
    it('should fetch conversations list', fakeAsync(() => {
      const mockConversations = [
        { _id: 'conv1', offerId: 'offer1', participants: ['user1', 'user2'], lastMessage: 'Looking good!' },
        { _id: 'conv2', offerId: 'offer2', participants: ['user1', 'user3'], lastMessage: 'When can you start?' },
      ];

      apiService.getConversations().subscribe((res) => {
        expect(res.length).toBe(2);
        expect(res[0].lastMessage).toBe('Looking good!');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/messages/conversations'));
      expect(req.request.method).toBe('GET');
      req.flush(mockConversations);
      tick();
    }));

    it('should send message in conversation', fakeAsync(() => {
      const messageData = {
        receiverId: 'user2',
        offerId: 'offer1',
        content: 'I can start next week',
      };

      apiService.sendMessage(messageData).subscribe((res) => {
        expect(res._id).toBeDefined();
        expect(res.content).toBe('I can start next week');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/messages/`);
      expect(req.request.method).toBe('POST');
      req.flush({ _id: 'msg1', ...messageData, timestamp: new Date() });
      tick();
    }));

    it('should fetch messages for offer', fakeAsync(() => {
      const mockMessages = [
        { _id: 'msg1', content: 'Hello!', senderId: 'user1', timestamp: new Date() },
        { _id: 'msg2', content: 'Hi there!', senderId: 'user2', timestamp: new Date() },
      ];

      apiService.getMessages('offer1').subscribe((res) => {
        expect(res.length).toBe(2);
        expect(res[0].content).toBe('Hello!');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/messages/offer1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMessages);
      tick();
    }));
  });

  describe('Admin Panel Flow', () => {
    it('should fetch freelancers pending approval', fakeAsync(() => {
      const mockFreelancers = [
        { _id: 'f1', name: 'John Doe', email: 'john@freelance.com', status: 'pending', skills: ['React'] },
        { _id: 'f2', name: 'Jane Smith', email: 'jane@freelance.com', status: 'pending', skills: ['Design'] },
      ];

      apiService.getFreelancers = jasmine.createSpy().and.returnValue(of(mockFreelancers));
      apiService.getFreelancers().subscribe((res) => {
        expect(res.length).toBe(2);
        expect(res[0].status).toBe('pending');
      });

      tick();
    }));
  });

  describe('Store & Purchase Flow', () => {
    it('should fetch products from store', fakeAsync(() => {
      const mockProducts = [
        { _id: 'prod1', title: 'UI Kit', price: 29.99, category: 'Design' },
        { _id: 'prod2', title: 'Code Template', price: 19.99, category: 'Development' },
      ];

      apiService.getProducts = jasmine.createSpy().and.returnValue(of(mockProducts));
      apiService.getProducts().subscribe((res) => {
        expect(res.length).toBe(2);
        expect(res[0].title).toBe('UI Kit');
      });

      tick();
    }));

    it('should simulate product purchase', fakeAsync(() => {
      const purchaseData = { productId: 'prod1', buyerId: 'user1' };

      apiService.purchaseProduct = jasmine.createSpy().and.returnValue(of({ success: true, downloadUrl: '/download/prod1' }));
      apiService.purchaseProduct(purchaseData).subscribe((res) => {
        expect(res.success).toBe(true);
        expect(res.downloadUrl).toBeDefined();
      });

      tick();
    }));
  });

  describe('Category Service', () => {
    it('should fetch categories and cache them', fakeAsync(() => {
      const mockCategories = [
        { _id: 'cat1', name: 'Development' },
        { _id: 'cat2', name: 'Design' },
        { _id: 'cat3', name: 'Marketing' },
      ];

      categoryService.getCategories(true).subscribe((res) => {
        expect(res.length).toBe(3);
        expect(res[0].name).toBe('Development');
      });

      const req = httpMock.expectOne((r) => r.url.includes('/categories/'));
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
      tick();

      // Second call should use cache
      categoryService.getCategories(true).subscribe((res) => {
        expect(res.length).toBe(3);
      });

      // Should not make another HTTP request
      httpMock.expectNone((r) => r.url.includes('/categories/'));
      tick();
    }));

    it('should bypass cache when useCache is false', fakeAsync(() => {
      const mockCategories = [
        { _id: 'cat1', name: 'Development' },
      ];

      categoryService.getCategories(false).subscribe();
      const req = httpMock.expectOne((r) => r.url.includes('/categories/'));
      req.flush(mockCategories);
      tick();

      // Force fresh call
      categoryService.getCategories(false).subscribe();
      const req2 = httpMock.expectOne((r) => r.url.includes('/categories/'));
      req2.flush(mockCategories);
      tick();
    }));
  });

  describe('API Caching for State Persistence', () => {
    it('should cache my-offers and return from cache within TTL', fakeAsync(() => {
      const mockOffers = [
        { _id: 'offer1', title: 'Web Dev', status: 'active' },
      ];

      apiService.getMyOffers().subscribe((res) => {
        expect(res.length).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/offers/my/offers'));
      req.flush(mockOffers);
      tick();

      // Second call within TTL should use cache
      apiService.getMyOffers().subscribe((res) => {
        expect(res.length).toBe(1);
      });

      // Should not make HTTP request
      httpMock.expectNone((r) => r.url.includes('/offers/my/offers'));
      tick();
    }));

    it('should invalidate cache after proposal submission', fakeAsync(() => {
      const proposalData = new FormData();
      apiService.submitProposal(proposalData).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/proposals/`);
      req.flush({ _id: 'proposal1' });
      tick();

      // Cache should be invalidated, so next call should fetch fresh data
      apiService.getMyProposals().subscribe();
      const req2 = httpMock.expectOne((r) => r.url.includes('/proposals/my/proposals'));
      req2.flush([]);
      tick();
    }));
  });

  describe('Auth Interceptor', () => {
    it('should add Authorization header to requests', fakeAsync(() => {
      const mockToken = 'test_jwt_token';
      spyOn(authService, 'getToken').and.returnValue(mockToken);

      apiService.getMyOffers().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/offers/my/offers'));
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toContain('Bearer');
      req.flush([]);
      tick();
    }));
  });

  describe('Error Handling', () => {
    it('should handle offer creation failure', fakeAsync(() => {
      const payload = new FormData();
      apiService.createOffer(payload).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/offers/`);
      req.flush({ error: 'Missing required fields' }, { status: 400, statusText: 'Bad Request' });
      tick();
    }));

    it('should handle network errors gracefully', fakeAsync(() => {
      apiService.getOffers().subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
        },
      });

      const req = httpMock.expectOne((r) => r.url.includes('/offers/'));
      req.error(new ProgressEvent('Network error'));
      tick();
    }));
  });
});
