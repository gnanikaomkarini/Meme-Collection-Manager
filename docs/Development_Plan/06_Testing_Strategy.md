# Development Plan: 06 - A Practical Testing Strategy (Google OAuth)

This guide provides an updated, actionable strategy for testing the application with its new Google OAuth flow.

---

## 1. Backend Testing: Mocking the Passport Session

Since we no longer have a registration endpoint to test, the main challenge is testing protected API routes that require an authenticated user. The most effective way to do this is to mock the authentication middleware.

1.  **Install Development Dependencies:**
    (Setup remains the same).
    ```bash
    # From the 'backend' directory
    npm install --save-dev jest supertest mongodb-memory-server
    ```

2.  **Write a Test for a Protected Endpoint:**
    This example shows how to test the `GET /api/memes` endpoint. Instead of trying to replicate the Google OAuth flow, we will use Jest to mock the `ensureAuth` middleware.

    *Create `backend/tests/memes.test.js`*
    ```javascript
    const request = require('supertest');
    const mongoose = require('mongoose');
    const app = require('../server');
    const { ensureAuth } = require('../middleware/auth.middleware');

    // Mock the authentication middleware
    jest.mock('../middleware/auth.middleware', () => ({
      ensureAuth: (req, res, next) => {
        // Mock a user object that Passport would normally create
        req.user = {
          _id: new mongoose.Types.ObjectId(),
          googleId: '12345',
          displayName: 'Test User'
        };
        next();
      }
    }));
    
    // In-memory database setup (beforeAll, afterAll) would be the same as previous guides...

    describe('GET /api/memes', () => {
      it('should return a list of memes for the authenticated user', async () => {
        // Since ensureAuth is mocked, this request will appear to be authenticated
        const res = await request(app).get('/api/memes');
        
        expect(res.statusCode).toEqual(200);
        // We can't be sure what will be in the body without seeding data,
        // but we can at least expect it to be an array.
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('POST /api/memes', () => {
        it('should create a new meme for the authenticated user', async () => {
            const newMeme = {
                caption: 'Test Meme',
                imageUrl: 'http://example.com/meme.jpg',
                category: 'Funny'
            };

            const res = await request(app)
                .post('/api/memes')
                .send(newMeme);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('caption', 'Test Meme');
            // The mocked req.user._id from the middleware should be assigned to the meme's user field.
            expect(res.body.user).toBeDefined(); 
        });
    });
    ```
    This approach cleanly separates the testing of your application logic from the testing of the authentication flow itself.

---

## 2. Frontend Testing: Testing UI Based on Auth State

Since the login and register components are gone, a practical test case is to verify that our `NavbarComponent` displays the correct information based on whether a user is logged in.

*`src/app/components/navbar/navbar.component.spec.ts`*
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService, User } from '../../services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: any;
  let userSubject: BehaviorSubject<User | null>;

  beforeEach(async () => {
    // Create a BehaviorSubject to control the mock auth state
    userSubject = new BehaviorSubject<User | null>(null);
    
    authServiceMock = {
      currentUser$: userSubject.asObservable(),
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the "Login with Google" button when logged out', () => {
    userSubject.next(null); // Simulate logged out state
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('.login-button');
    const userInfo = fixture.nativeElement.querySelector('.user-info');
    
    expect(loginButton).not.toBeNull();
    expect(userInfo).toBeNull();
    expect(loginButton.textContent).toContain('Login with Google');
  });

  it('should display user information and logout button when logged in', () => {
    const mockUser: User = {
      _id: '1',
      googleId: '123',
      displayName: 'Test User',
      email: 'test@example.com',
      profileImage: 'http://example.com/img.png'
    };
    userSubject.next(mockUser); // Simulate logged in state
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('.login-button');
    const userInfo = fixture.nativeElement.querySelector('.user-info');
    
    expect(loginButton).toBeNull();
    expect(userInfo).not.toBeNull();
    expect(userInfo.textContent).toContain('Welcome, Test User');
  });

  it('should call authService.logout when logout button is clicked', () => {
    userSubject.next({ _id: '1', googleId: '123', displayName: 'Test', email: 'a@b.com', profileImage: '' });
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector('button');
    logoutButton.click();

    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
```
This testing strategy is adapted to the new OAuth flow, ensuring our application logic and UI state management are still robust and verifiable.