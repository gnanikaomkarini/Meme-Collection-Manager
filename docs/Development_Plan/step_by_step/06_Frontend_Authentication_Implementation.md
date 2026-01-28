# Guide: 06 - Implementing Frontend Authentication

This guide provides a complete, step-by-step plan for building the frontend of the Meme Collection Manager using Angular. It covers project setup, creating a user interface with Angular Material, and implementing the full authentication flow to communicate with the backend you've already built.

This guide assumes the Angular project files are located directly inside the `/frontend` directory.

---

### **Prerequisites**

*   You have Node.js and the Angular CLI installed (`npm install -g @angular/cli`).
*   Your backend server is running and accessible at `http://localhost:3000`.

---

### **Step 1: Initialize the Angular Project**

First, navigate to the `frontend` directory and initialize it as an Angular application.

1.  Open your terminal and navigate to the `frontend` directory.
2.  If the directory is empty, you can generate the project files directly inside it. If you have already created the project, you can skip to Step 2.
    ```bash
    # Run this from within the /frontend directory
    ng new . --routing --style=scss
    ```
    *   `ng new .`: The `.` tells the CLI to create the project in the current directory.
    *   `--routing`: This flag creates a separate `app-routing.module.ts` file to handle application navigation.
    *   `--style=scss`: This sets the project's stylesheet format to SCSS.

### **Step 2: Add Angular Material**

We will use Angular Material to quickly build a clean, modern user interface.

1.  From within the `frontend` directory, run the following command:
    ```bash
    ng add @angular/material
    ```
2.  The CLI will ask you a few questions to set up the library:
    *   **Choose a prebuilt theme name, or "custom"**: Select a theme (e.g., `Indigo/Pink`).
    *   **Set up global Angular Material typography styles?**: Choose `Yes`.
    *   **Set up browser animations for Angular Material?**: Choose `Include and enable animations`.

### **Step 3: Configure Environment Files**

Just as with the backend, we need to tell the frontend where to find the backend API.

1.  Open `frontend/src/environments/environment.ts`.
2.  Replace its content with the following to define your backend URL.
    ```typescript
    export const environment = {
      production: false,
      backendUrl: 'http://localhost:3000'
    };
    ```

### **Step 4: Create the Core Authentication Service**

This service will be the central point for handling all authentication logic, such as checking the user's status and logging them in or out.

1.  Generate the service using the Angular CLI:
    ```bash
    ng generate service services/auth
    ```
2.  Open the new file `frontend/src/app/services/auth.service.ts` and replace its content with the following:
    ```typescript
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { BehaviorSubject, Observable } from 'rxjs';
    import { tap, catchError } from 'rxjs/operators';
    import { of } from 'rxjs';
    import { environment } from '../../environments/environment';

    // Define the structure of the User object
    export interface User {
      _id: string;
      googleId: string;
      displayName: string;
      email: string;
      profileImage: string;
    }
    
    // Define the structure of the API response envelope
    export interface ApiResponse<T> {
        status: { success: boolean, error: any };
        data: T | null;
    }

    @Injectable({
      providedIn: 'root'
    })
    export class AuthService {
      // A BehaviorSubject holds the current user value. null means the user is logged out.
      private userSubject = new BehaviorSubject<User | null>(null);
      // Expose the user state as a public observable for components to subscribe to.
      public user$ = this.userSubject.asObservable();

      constructor(private http: HttpClient) {
        // When the service is first created, immediately check the user's auth status.
        this.checkAuthStatus().subscribe();
      }

      // Check the backend's /current_user endpoint
      checkAuthStatus(): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${environment.backendUrl}/auth/current_user`, { withCredentials: true }).pipe(
          tap(response => {
            if (response.status.success && response.data) {
              this.userSubject.next(response.data); // Update user state on success
            } else {
              this.userSubject.next(null); // Ensure user is null on failure
            }
          }),
          catchError(() => {
            this.userSubject.next(null); // On HTTP error, set user to null
            return of(); // Return an empty observable to complete the stream
          })
        );
      }

      // To log in, we redirect the entire window to the backend's Google auth route
      login(): void {
        window.location.href = `${environment.backendUrl}/auth/google`;
      }

      // To log out, we redirect to the backend's logout route
      logout(): void {
        window.location.href = `${environment.backendUrl}/auth/logout`;
      }
    }
    ```

### **Step 5: Set Up a Basic App Layout and UI**

Now, let's create a simple toolbar that shows the user's status and login/logout buttons.

1.  **Import Modules**: Open `frontend/src/app/app.module.ts` and add `HttpClientModule` (for making API requests) and the necessary Material modules.
    ```typescript
    // Other imports...
    import { HttpClientModule } from '@angular/common/http';
    import { MatToolbarModule } from '@angular/material/toolbar';
    import { MatButtonModule } from '@angular/material/button';
    import { MatIconModule } from '@angular/material/icon';

    @NgModule({
      declarations: [ /* ... */ ],
      imports: [
        // ... Other modules
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    ```

2.  **Update the Main Component Logic**: Open `frontend/src/app/app.component.ts` and connect it to the `AuthService`.
    ```typescript
    import { Component } from '@angular/core';
    import { AuthService, User } from './services/auth.service';
    import { Observable } from 'rxjs';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.scss']
    })
    export class AppComponent {
      user$: Observable<User | null>;

      constructor(private authService: AuthService) {
        this.user$ = this.authService.user$;
      }

      login(): void {
        this.authService.login();
      }

      logout(): void {
        this.authService.logout();
      }
    }
    ```
3.  **Update the Main Component HTML**: Open `frontend/src/app/app.component.html` and replace its content with this layout.
    ```html
    <mat-toolbar color="primary">
      <span>Meme Collection Manager</span>
      <span class="spacer"></span>
      
      <!-- Show Login button if user is logged out -->
      <ng-container *ngIf="(user$ | async) === null">
        <button mat-flat-button (click)="login()">
          <mat-icon>login</mat-icon>
          Login with Google
        </button>
      </ng-container>

      <!-- Show user name and Logout button if user is logged in -->
      <ng-container *ngIf="user$ | async as user">
        <span>Hello, {{ user.displayName }}</span>
        <button mat-icon-button (click)="logout()" aria-label="Logout button">
          <mat-icon>logout</mat-icon>
        </button>
      </ng-container>
    </mat-toolbar>

    <!-- This is where your page content will be rendered -->
    <router-outlet></router-outlet>
    ```

### **Step 6: Run and Test the Frontend**

1.  From the `frontend` directory, run the Angular development server:
    ```bash
    ng serve
    ```
2.  Open your browser and navigate to `http://localhost:4200`.
3.  You should see your toolbar. Click the "Login with Google" button. You should be redirected to Google, then back to your app, and the toolbar should now show "Hello, [Your Name]" and a logout button.

Congratulations! You now have a working frontend with a complete authentication flow. The next steps would be to create a protected "dashboard" page and use an Auth Guard to prevent access to it when logged out.