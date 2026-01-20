# Development Plan: 06 - A Practical Testing Strategy

This guide provides a complete, actionable starting point for writing both backend and frontend tests. It moves from placeholder examples to a working, copy-pasteable foundation.

---

## 1. Backend Testing: A Complete Example

We will set up a professional testing environment for the backend using Jest for running tests, Supertest for making HTTP requests to our API, and `mongodb-memory-server` to run our tests against a clean, in-memory database without affecting our real data.

1.  **Install Development Dependencies:**
    ```bash
    # From the 'backend' directory
    npm install --save-dev jest supertest mongodb-memory-server
    ```

2.  **Configure Jest:**
    (The `jest.config.js` file and the `test` script in `package.json` remain the same as in the previous guide).

3.  **Write a Complete, Working API Test:**
    This example shows how to test the user registration endpoint. It sets up and tears down a test database for each test run.

    *Create `backend/tests/auth.test.js`*
    ```javascript
    const request = require('supertest');
    const mongoose = require('mongoose');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const app = require('../server'); // Assumes server.js conditionally exports 'app'
    const User = require('../models/user.model');

    let mongoServer;

    // Before all tests, create an in-memory MongoDB instance.
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    });

    // After all tests, disconnect from Mongoose and stop the memory server.
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });

    // Before each test, clear the User collection.
    beforeEach(async () => {
      await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
      it('should register a new user successfully and return user object', async () => {
        const newUser = {
          username: 'testuser',
          password: 'password123',
        };

        const res = await request(app)
          .post('/api/auth/register')
          .send(newUser);

        // Assertions
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.username).toBe('testuser');

        // Verify user was actually saved to the database
        const savedUser = await User.findOne({ username: 'testuser' });
        expect(savedUser).not.toBeNull();
      });

      it('should fail to register a user with a duplicate username', async () => {
        const newUser = { username: 'testuser', password: 'password123' };
        
        // First, create the user
        await request(app).post('/api/auth/register').send(newUser);
        
        // Then, try to create the same user again
        const res = await request(app).post('/api/auth/register').send(newUser);

        // Assertions for the second attempt
        expect(res.statusCode).toBe(500); // Or whatever your error handler returns
      });
    });
    ```

---

## 2. Frontend Testing: A Practical Example

(The setup for frontend testing remains the same as in the previous guide. The example below is a slightly more advanced and practical test for the `LoginComponent`).

*`src/app/components/login/login.component.spec.ts`*
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  // Create a mock AuthService
  const mockAuthService = {
    login: jest.fn() // Using jest.fn() for spying
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should not call login service if form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call login service when form is valid', () => {
    // Mock a successful login
    mockAuthService.login.mockReturnValue(of({ _id: '1', username: 'test' }));
    
    component.loginForm.controls.username.setValue('testuser');
    component.loginForm.controls.password.setValue('password123');
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('should display an error message on failed login', () => {
    // Mock a failed login
    const errorResponse = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.mockReturnValue(throwError(() => errorResponse));

    component.loginForm.controls.username.setValue('testuser');
    component.loginForm.controls.password.setValue('password123');
    
    component.onSubmit();
    fixture.detectChanges(); // Update the view with the error

    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl.textContent).toContain('Invalid credentials');
    expect(component.error).toBe('Invalid credentials');
  });
});
```
This completes the testing strategy, providing a fully working foundation for ensuring the application is correct, secure, and maintainable.