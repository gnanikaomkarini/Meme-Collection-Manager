# Development Plan: 04 - Frontend Authentication

This guide covers setting up the Angular frontend to handle user registration and login. We will create the UI, build a service to communicate with our backend, and implement route guards to protect certain pages from unauthenticated users.

**Note:** All commands and paths are relative to the `frontend/meme-app` directory.

---

### **Step 1: Generate Necessary Components and Services**

First, use the Angular CLI to generate the files you'll need.

```bash
# Generate components for login, registration, and a navigation bar
ng generate component components/login
ng generate component components/register
ng generate component components/navbar

# Generate a service to handle authentication logic
ng generate service services/auth

# Generate a route guard to protect routes
ng generate guard guards/auth
```
When prompted to choose which interfaces the guard should implement, select **`CanActivate`**.

---

### **Step 2: Implement the Authentication Service**

This service will be responsible for all communication with the backend's `/api/auth` endpoints.

1.  **Import `HttpClientModule`:**
    Before the service can make HTTP requests, you must import `HttpClientModule` into your main app module.
    ```typescript
    // src/app/app.module.ts
    import { HttpClientModule } from '@angular/common/http';

    @NgModule({
      // ...
      imports: [
        // ...
        HttpClientModule
      ],
      // ...
    })
    ```

2.  **Code the `AuthService`:**
    This service will have methods for `login` and `register`, along with methods to handle saving, retrieving, and removing the JWT from the browser's `localStorage`.

    ```typescript
    // src/app/services/auth.service.ts
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, BehaviorSubject } from 'rxjs';
    import { tap } from 'rxjs/operators';
    import { Router } from '@angular/router';

    @Injectable({
      providedIn: 'root'
    })
    export class AuthService {
      private apiUrl = 'http://localhost:3000/api/auth';
      private userSubject = new BehaviorSubject<any | null>(null);

      constructor(private http: HttpClient, private router: Router) {
        // When the service initializes, try to load user data from localStorage
        this.loadUser();
      }

      private loadUser() {
        if (typeof localStorage !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                this.userSubject.next(JSON.parse(user));
            }
        }
      }

      register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
      }

      login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
          tap(user => {
            // On successful login, save user and token to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
          })
        );
      }

      logout(): void {
        // Remove user from localStorage and update subject
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      }

      getUser() {
        return this.userSubject.asObservable();
      }

      getToken(): string | null {
        const user = this.userSubject.getValue();
        return user ? user.token : null;
      }

      isLoggedIn(): boolean {
        return this.userSubject.getValue() !== null;
      }
    }
    ```

---

### **Step 3: Build the Login and Register Components**

These components will contain simple forms for user input.

1.  **Import `FormsModule`:** To use `[(ngModel)]` for two-way data binding in your forms, import `FormsModule` in `app.module.ts`.
    ```typescript
    // src/app/app.module.ts
    import { FormsModule } from '@angular/forms';

    @NgModule({
      //...
      imports: [
        //...
        FormsModule
      ],
      //...
    })
    ```

2.  **Code the Login Component:**
    *   **`login.component.html`**
        ```html
        <h2>Login</h2>
        <form (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username:</label>
            <input type="text" [(ngModel)]="credentials.username" name="username" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a routerLink="/register">Register</a></p>
        ```
    *   **`login.component.ts`**
        ```typescript
        import { Component } from '@angular/core';
        import { AuthService } from '../../services/auth.service';
        import { Router } from '@angular/router';

        @Component({
          selector: 'app-login',
          templateUrl: './login.component.html',
        })
        export class LoginComponent {
          credentials = { username: '', password: '' };

          constructor(private authService: AuthService, private router: Router) {}

          onSubmit(): void {
            this.authService.login(this.credentials).subscribe(
              () => this.router.navigate(['/memes']),
              (err) => console.error('Login failed', err)
            );
          }
        }
        ```

3.  **Code the Register Component (Similar to Login):**
    *   **`register.component.html`**
        ```html
        <h2>Register</h2>
        <form (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username:</label>
            <input type="text" [(ngModel)]="userData.username" name="username" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" [(ngModel)]="userData.password" name="password" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a routerLink="/login">Login</a></p>
        ```
    *   **`register.component.ts`**
        ```typescript
        import { Component } from '@angular/core';
        import { AuthService } from '../../services/auth.service';
        import { Router } from '@angular/router';

        @Component({
          selector: 'app-register',
          templateUrl: './register.component.html',
        })
        export class RegisterComponent {
          userData = { username: '', password: '' };

          constructor(private authService: AuthService, private router: Router) {}

          onSubmit(): void {
            this.authService.register(this.userData).subscribe(
              () => this.router.navigate(['/login']), // Redirect to login after successful registration
              (err) => console.error('Registration failed', err)
            );
          }
        }
        ```

---

### **Step 4: Configure Routing and the Auth Guard**

Now, set up the app's navigation and protect the routes that require a user to be logged in.

1.  **Code the `AuthGuard`:**
    This guard will check if the user is logged in using the `AuthService`. If not, it will redirect them to the login page.
    ```typescript
    // src/app/guards/auth.guard.ts
    import { Injectable } from '@angular/core';
    import { CanActivate, Router } from '@angular/router';
    import { AuthService } from '../services/auth.service';

    @Injectable({
      providedIn: 'root'
    })
    export class AuthGuard implements CanActivate {
      constructor(private authService: AuthService, private router: Router) {}

      canActivate(): boolean {
        if (this.authService.isLoggedIn()) {
          return true; // User is logged in, allow access
        } else {
          this.router.navigate(['/login']); // User is not logged in, redirect to login
          return false;
        }
      }
    }
    ```

2.  **Update the App Routing:**
    Define all your application's routes and apply the `AuthGuard` to the ones you want to protect.
    ```typescript
    // src/app/app-routing.module.ts
    import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { LoginComponent } from './components/login/login.component';
    import { RegisterComponent } from './components/register/register.component';
    // Import your meme components here later
    // import { MemeListComponent } from './components/meme-list/meme-list.component';
    import { AuthGuard } from './guards/auth.guard';

    const routes: Routes = [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      // Example of a protected route:
      // { path: 'memes', component: MemeListComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: '/login', pathMatch: 'full' }
    ];

    @NgModule({
      imports: [RouterModule.forRoot(routes)],
      exports: [RouterModule]
    })
    export class AppRoutingModule { }
    ```

### **Step 5: Create a Global Navigation Bar**

The navbar will show different links depending on whether the user is logged in.

1.  **Code the `navbar` component:**
    *   **`navbar.component.html`**
        ```html
        <nav>
          <h1><a routerLink="/">Meme Manager</a></h1>
          <ul>
            <ng-container *ngIf="isLoggedIn; else loggedOut">
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
    *   **`navbar.component.ts`**
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { AuthService } from '../../services/auth.service';

        @Component({
          selector: 'app-navbar',
          templateUrl: './navbar.component.html',
        })
        export class NavbarComponent implements OnInit {
          isLoggedIn = false;

          constructor(private authService: AuthService) {}

          ngOnInit(): void {
            this.authService.getUser().subscribe(user => {
              this.isLoggedIn = !!user;
            });
          }

          logout(): void {
            this.authService.logout();
          }
        }
        ```

2.  **Add the navbar to your main app component:**
    Place the navbar at the top of your `app.component.html` so it appears on every page.
    ```html
    // src/app/app.component.html
    <app-navbar></app-navbar>
    <router-outlet></router-outlet> <!-- Your page content will be rendered here -->
    ```

Your frontend authentication is now set up. Users can register, log in, and log out. The next and final guide will cover implementing the CRUD functionality for memes and sending the auth token with every request.
