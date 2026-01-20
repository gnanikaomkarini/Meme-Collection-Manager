# Development Plan: 04 - Frontend Authentication (Resilient & User-Friendly)

This guide is rewritten to build a professional frontend authentication experience. It solves the "lost session on refresh" problem and provides detailed, user-friendly form validation.

---

### **Step 1: Generate Components, Services, and Guards**

(This step remains the same)
```bash
ng generate component components/login
ng generate component components/register
ng generate component components/navbar
ng generate service services/auth
ng generate guard guards/auth
```
When prompted, select **`CanActivate`** for the guard.

---

### **Step 2: Implement a Resilient Authentication Service**

This service is updated to verify authentication status when the app first loads.

1.  **Code the `AuthService` in `src/app/services/auth.service.ts`:**
    ```typescript
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, BehaviorSubject, of } from 'rxjs';
    import { tap, map, catchError, first } from 'rxjs/operators';
    import { Router } from '@angular/router';
    import { environment } from '../../environments/environment';

    export interface User { _id: string; username: string; }

    @Injectable({ providedIn: 'root' })
    export class AuthService {
      private apiUrl = `${environment.apiUrl}/auth`;
      private userSubject = new BehaviorSubject<User | null>(null);
      public currentUser$ = this.userSubject.asObservable();

      constructor(private http: HttpClient, private router: Router) {}

      // Called by APP_INITIALIZER to check for an existing session
      initializeAuthState(): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/status`).pipe(
          tap(user => {
            this.userSubject.next(user);
          }),
          catchError(() => {
            this.userSubject.next(null);
            return of(null);
          })
        );
      }

      login(credentials: any): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
          tap(user => this.userSubject.next(user))
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

      // ... (register method) ...
    }
    ```

---

### **Step 3: Initialize Auth State on Application Startup**

Use Angular's `APP_INITIALIZER` to call our new `initializeAuthState` method *before* the app becomes visible. This prevents the UI from flickering between logged-out and logged-in states.

1.  **Define the initializer factory function and provider in `app.module.ts`:**
    ```typescript
    // src/app/app.module.ts
    import { APP_INITIALIZER, NgModule } from '@angular/core';
    import { Observable } from 'rxjs';
    import { AuthService } from './services/auth.service';
    // ... other imports

    function initializeApp(authService: AuthService): () => Observable<any> {
      return () => authService.initializeAuthState();
    }

    @NgModule({
      declarations: [ /*...*/ ],
      imports: [ /*...*/ ],
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: initializeApp,
          deps: [AuthService],
          multi: true
        }
      ],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    ```

---

### **Step 4: Build Forms with Per-Field Validation Messages**

Update the components to show the user exactly what is wrong with their input.

1.  **Import `ReactiveFormsModule` in `app.module.ts`** if you haven't already.
2.  **Code the `Login` Component:**
    *   **`login.component.ts`** (The TypeScript remains largely the same, but we add a helper getter for easier template access).
        ```typescript
        // ...
        export class LoginComponent {
          // ...
          get f() { return this.loginForm.controls; } // Helper getter
          // ...
        }
        ```
    *   **`login.component.html`** (Now with detailed validation).
        ```html
        <h2>Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" formControlName="username" class="form-control"
                   [ngClass]="{ 'is-invalid': f.username.touched && f.username.invalid }">
            <div *ngIf="f.username.touched && f.username.invalid" class="invalid-feedback">
              <div *ngIf="f.username.errors?.required">Username is required.</div>
            </div>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" formControlName="password" class="form-control"
                   [ngClass]="{ 'is-invalid': f.password.touched && f.password.invalid }">
            <div *ngIf="f.password.touched && f.password.invalid" class="invalid-feedback">
              <div *ngIf="f.password.errors?.required">Password is required.</div>
            </div>
          </div>
          <div *ngIf="error" class="error-message">{{ error }}</div>
          <button type="submit" [disabled]="loginForm.invalid">Login</button>
        </form>
        ```
*The **Register Component** should be updated with similar per-field validation.*

---

### **Step 5: Update the `AuthGuard`**

The `AuthGuard` must now wait for the initial auth state to be resolved before it can make a decision.

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, first } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      first(), // Only take the first emitted value after initialization
      map(user => {
        if (user) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
```
The application now correctly maintains login state across page refreshes and provides a much better user experience during form input.