# Development Plan: 04 - Frontend Authentication (Google OAuth)

This guide is completely rewritten to integrate the frontend with our new Google OAuth backend. The process is much simpler, as we no longer need to manage forms, validation, or tokens.

---

### **Step 1: Generate Core Components**

We no longer need login or register components. We just need a central navigation bar and a landing page for unauthenticated users.

```bash
ng generate component components/navbar
ng generate component components/home # A landing page
ng generate service services/auth
ng generate guard guards/auth
```
When prompted, select **`CanActivate`** for the guard.

---

### **Step 2: Implement the Simplified Authentication Service**

The `AuthService` is now only responsible for two things: checking the current user's session on startup and providing a way to log out.

1.  **Update the User model in `auth.service.ts`:**
    ```typescript
    // This can be in its own file, e.g., src/app/models/user.model.ts
    export interface User {
      _id: string;
      googleId: string;
      displayName: string;
      email: string;
      profileImage: string;
    }
    ```

2.  **Code the `AuthService` in `src/app/services/auth.service.ts`:**
    ```typescript
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, BehaviorSubject, of } from 'rxjs';
    import { tap, catchError } from 'rxjs/operators';
    import { environment } from '../../environments/environment';
    import { User } from '../models/user.model'; // Import the new User model

    @Injectable({ providedIn: 'root' })
    export class AuthService {
      private apiUrl = `${environment.apiUrl}/auth`;
      private userSubject = new BehaviorSubject<User | null>(null);
      public currentUser$ = this.userSubject.asObservable();

      constructor(private http: HttpClient) {}

      // Called on app startup to check for an existing session
      initializeAuthState(): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/current_user`).pipe(
          tap(user => this.userSubject.next(user)),
          catchError(() => {
            this.userSubject.next(null);
            return of(null);
          })
        );
      }

      // Logout is now a simple navigation
      logout(): void {
        // We perform a full page navigation to the logout endpoint.
        // The server will handle clearing the session cookie and redirecting.
        window.location.href = `${this.apiUrl}/logout`;
      }
    }
    ```

---

### **Step 3: Initialize Auth State on Application Startup**

(This step remains conceptually the same but is now even more critical).

We use Angular's `APP_INITIALIZER` to call `initializeAuthState` *before* the app renders. This ensures that when a user lands on the site, we already know if they have a valid session.

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
      // ...
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: initializeApp,
          deps: [AuthService],
          multi: true
        }
      ],
      // ...
    })
    export class AppModule { }
    ```

---

### **Step 4: Build the UI (No Forms Needed)**

The UI is now much simpler.

1.  **Code the `Home` Component (`home.component.html`):**
    This is a simple landing page for users who are not logged in.
    ```html
    <div class="landing-page">
      <h1>Welcome to the Meme Collection Manager</h1>
      <p>Please log in to continue.</p>
      <a href="http://localhost:3000/api/auth/google" class="login-button">
        Login with Google
      </a>
    </div>
    ```

2.  **Code the `Navbar` Component (`navbar.component.ts` & `navbar.component.html`):**
    The navbar will subscribe to the `currentUser observable from the `AuthService` to show the correct state.

    *   `navbar.component.ts`:
        ```typescript
        import { Component } from '@angular/core';
        import { AuthService, User } from '../../services/auth.service';
        import { Observable } from 'rxjs';

        @Component({ selector: 'app-navbar', /*...*/ })
        export class NavbarComponent {
          currentUser$: Observable<User | null>;
          constructor(private authService: AuthService) {
            this.currentUser$ = this.authService.currentUser$;
          }
          logout(): void {
            this.authService.logout();
          }
        }
        ```
    *   `navbar.component.html`:
        ```html
        <nav>
          <a routerLink="/"><h1>Meme Manager</h1></a>
          <ng-container *ngIf="currentUser$ | async as user; else loggedOut">
            <div class="user-info">
              <img [src]="user.profileImage" alt="Profile Picture">
              <span>Welcome, {{ user.displayName }}</span>
              <a routerLink="/memes">My Memes</a>
              <button (click)="logout()">Logout</button>
            </div>
          </ng-container>
          <ng-template #loggedOut>
            <a href="http://localhost:3000/api/auth/google" class="login-button">
              Login with Google
            </a>
          </ng-template>
        </nav>
        ```

---

### **Step 5: Update the `AuthGuard`**

(The AuthGuard logic remains nearly identical, as it relies on the `currentUser observable which we have preserved).

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, first } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      first(), // Crucially, wait for the APP_INITIALIZER to finish
      map(user => {
        if (user) {
          return true; // User has a session, allow access
        }
        this.router.navigate(['/']); // No session, redirect to home/landing page
        return false;
      })
    );
  }
}
```
The frontend authentication logic is now dramatically simplified, more secure, and provides a better user experience by removing manual login steps.