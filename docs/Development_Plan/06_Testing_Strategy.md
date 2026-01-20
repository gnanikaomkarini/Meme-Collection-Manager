# Development Plan: 06 - Testing Strategy

This guide provides a starting point for writing backend and frontend tests to ensure application quality and maintainability.

---

## 1. Backend Testing with Jest and Supertest

Testing your backend API endpoints is crucial to verify that your logic is correct and your routes are secure.

1.  **Install Development Dependencies:**
    ```bash
    # From the 'backend' directory
    npm install --save-dev jest supertest
    ```

2.  **Configure Jest:**
    Create a `jest.config.js` file in the `backend` root directory.
    ```javascript
    // backend/jest.config.js
    module.exports = {
      testEnvironment: 'node',
      testMatch: ['**/?(*.)+(spec|test).js'],
    };
    ```

3.  **Add a `test` script to `package.json`:**
    ```json
    // In backend/package.json
    "scripts": {
      "start": "nodemon server.js",
      "test": "jest"
    }
    ```

4.  **Write a Sample API Test:**
    To test your app, you need to export the Express `app` object from your `server.js` file. Then you can write tests.
    
    *Example: Create `backend/routes/auth.test.js`*
    ```javascript
    const request = require('supertest');
    // You'll need to export your Express app from server.js for testing.
    // For example, at the end of server.js, add: module.exports = app;
    // const app = require('../server'); 

    describe('Auth API Endpoints', () => {
      it('should return an error for missing registration details', async () => {
        // This is a placeholder test. A real implementation would require
        // exporting the app from server.js and setting up a test database.
        
        // const res = await request(app)
        //   .post('/api/auth/register')
        //   .send({ username: 'testuser' }); // Missing password
        
        // expect(res.statusCode).toEqual(400);
        expect(true).toBe(true); // Placeholder assertion
      });
    });
    ```

---

## 2. Frontend Testing with Angular's Tools

The Angular CLI has already configured a powerful testing environment using Karma and Jasmine.

1.  **Locate Test Files:**
    For every component or service you generate (e.g., `login.component.ts`), the CLI also creates a test file (`login.component.spec.ts`) right next to it.

2.  **Write a Basic Component Test:**
    Let's look at a test for the `LoginComponent` to verify that the form is invalid when it's first created.

    *`src/app/components/login/login.component.spec.ts`*
    ```typescript
    import { ComponentFixture, TestBed } from '@angular/core/testing';
    import { LoginComponent } from './login.component';
    import { ReactiveFormsModule } from '@angular/forms';
    import { HttpClientTestingModule } from '@angular/common/http/testing';
    import { RouterTestingModule } from '@angular/router/testing';

    describe('LoginComponent', () => {
      let component: LoginComponent;
      let fixture: ComponentFixture<LoginComponent>;

      beforeEach(async () => {
        // Set up the testing module with all necessary dependencies
        await TestBed.configureTestingModule({
          declarations: [ LoginComponent ],
          imports: [
            ReactiveFormsModule,
            HttpClientTestingModule,
            RouterTestingModule
          ]
        }).compileComponents();
      });

      // A simple test to ensure the component itself is created successfully
      it('should create', () => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // Trigger change detection
        expect(component).toBeTruthy();
      });

      // A test to check our form's initial validation logic
      it('form should be invalid when empty', () => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.loginForm.valid).toBeFalsy();
      });
    });
    ```

3.  **Run Frontend Tests:**
    Execute this command from the `frontend/meme-app` directory.
    ```bash
    ng test
    ```
    This will launch a test runner in your browser that automatically watches for changes and re-runs your tests.
