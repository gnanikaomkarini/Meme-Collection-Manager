# Development Plan: 04 - Frontend Authentication (Secure & User-Friendly)

This guide covers setting up the Angular frontend to work with the secure, cookie-based authentication system. It focuses on state management, strongly-typed forms, and providing feedback to the user.

**Note:** All commands and paths are relative to the `frontend/meme-app` directory.

---

### **Step 1: Generate Components, Services, and Guards**

```bash
# Generate components for login, registration, and a navigation bar
ng generate component components/login
ng generate component components/register
ng generate component components/navbar

# Generate a service to manage authentication state
ng generate service services/auth

# Generate a route guard to protect pages
ng generate guard guards/auth
```
When prompted for the guard, select **`CanActivate`**.

---

### **Step 2: Implement the Secure Authentication Service**

This service is rewritten to manage authentication *state* rather than tokens. It does not touch `localStorage` or tokens directly; that is all handled securely between the browser and the backend.

1.  **Import `HttpClientModule` in `src/app/app.module.ts`** if you haven't already.

2.  **Code the `AuthService`:**
    ```typescript
    // src/app/services/auth.service.ts
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, BehaviorSubject, of } from 'rxjs';
    import { tap, catchError, map } from 'rxjs/operators';
    import { Router } from '@angular/router';
    import { environment } from '../../environments/environment';

    // Strongly-typed User object
    export interface User {
      _id: string;
      username: string;
    }

    @Injectable({
      providedIn: 'root'
    })
    export class AuthService {
      private apiUrl = `${environment.apiUrl}/auth`;
      // BehaviorSubject holds the current user object or null
      private userSubject = new BehaviorSubject<User | null>(null);
      public currentUser = this.userSubject.asObservable();

      constructor(private http: HttpClient, private router: Router) {}

      register(credentials: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, credentials);
      }

      login(credentials: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
          tap(user => {
            this.userSubject.next(user);
          })
        );
      }

      logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
          tap(() => {
            this.userSubject.next(null);
            this.router.navigate(['/login']);
          })
        );
      }

      // Add a way to check auth status on app load
      checkAuthStatus(): Observable<User | null> {
          // This would ideally hit a '/me' endpoint that returns the user if the cookie is valid
          // For now, we'll assume if the subject is null, we need to check
          if (this.userSubject.getValue()) {
              return of(this.userSubject.getValue());
          }
          // In a real app, you might make an HTTP call here to a '/me' endpoint
          return of(null);
      }
      
      isLoggedIn(): boolean {
          return this.userSubject.getValue() !== null;
      }
    }
    ```

---

### **Step 3: Build Strongly-Typed Login/Register Components with Error Handling**

1.  **Import `ReactiveFormsModule`:** For more robust and scalable forms, we'll use Reactive Forms instead of template-driven (`FormsModule`).
    ```typescript
    // src/app/app.module.ts
    import { ReactiveFormsModule } from '@angular/forms';
    @NgModule({
      imports: [ /*...,*/ ReactiveFormsModule ],
    })
    ```
2.  **Code the Login Component:**
    *   **`login.component.ts`**
        ```typescript
        import { Component } from '@angular/core';
        import { FormBuilder, FormGroup, Validators } from '@angular/forms';
        import { Router } from '@angular/router';
        import { AuthService } from '../../services/auth.service';

        @Component({
          selector: 'app-login',
          templateUrl: './login.component.html',
        })
        export class LoginComponent {
          loginForm: FormGroup;
          error: string | null = null;

          constructor(
            private fb: FormBuilder,
            private authService: AuthService,
            private router: Router
          ) {
            this.loginForm = this.fb.group({
              username: ['', Validators.required],
              password: ['', Validators.required],
            });
          }

          onSubmit(): void {
            if (this.loginForm.invalid) {
              return;
            }
            this.error = null;
            this.authService.login(this.loginForm.value).subscribe({
              next: () => this.router.navigate(['/memes']),
              error: (err) => this.error = err.error.message || 'Login failed. Please try again.'
            });
          }
        }
        ```
    *   **`login.component.html`**
        ```html
        <h2>Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username:</label>
            <input type="text" formControlName="username">
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" formControlName="password">
          </div>
          <div *ngIf="error" class="error-message">{{ error }}</div>
          <button type="submit" [disabled]="loginForm.invalid">Login</button>
        </form>
        <p>Don't have an account? <a routerLink="/register">Register</a></p>
        ```
    *The **Register Component** should be built in the same way, using a `FormGroup` and displaying any errors returned from the service.*

---

### **Step 4: Configure the `AuthGuard`**

The guard now checks the state from the `AuthService` instead of `localStorage`.

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (user) {
          return true; // Logged in, allow access
        }
        this.router.navigate(['/login']); // Not logged in, redirect
        return false;
      })
    );
  }
}
```

### **Step 5: Build a Dynamic Navigation Bar**

The `navbar` component subscribes to the `currentUser` observable from the `AuthService` to dynamically update the UI based on authentication state.

*   **`navbar.component.ts`**
    ```typescript
    import { Component } from '@angular/core';
    import { Observable } from 'rxjs';
    import { AuthService, User } from '../../services/auth.service';

    @Component({
      selector: 'app-navbar',
      templateUrl: './navbar.component.html',
    })
    export class NavbarComponent {
      currentUser$: Observable<User | null>;

      constructor(private authService: AuthService) {
        this.currentUser$ = this.authService.currentUser;
      }

      logout(): void {
        this.authService.logout().subscribe();
      }
    }
    ```
*   **`navbar.component.html`**
    ```html
    <nav>
      <h1><a routerLink="/">Meme Manager</a></h1>
      <ul>
        <ng-container *ngIf="currentUser$ | async as user; else loggedOut">
          <li>Welcome, {{ user.username }}!</li>
          <li><a routerLink="/memes">My Memes</a></li>
          <li><a (click)="logout()">Logout</a></li>
        </ng-container>
        <ng-template #loggedOut>
          <li><a routerLink="/login">Login</a></li>
          <li><a routerLink="/register">Register</a></li>
        </ng-template>
      </ul>
    </nav>
    ```

The frontend authentication is now correctly set up to manage session state without insecurely handling tokens in JavaScript, and provides a better user experience with proper form validation and error feedback.
