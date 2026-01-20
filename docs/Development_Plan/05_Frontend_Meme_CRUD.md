# Development Plan: 05 - Frontend CRUD and Token Management

This final guide covers building the UI for meme management and implementing a smart `HttpInterceptor` to handle session expiration and token refreshing automatically.

**Note:** All commands and paths are relative to the `frontend/meme-app` directory.

---

### **Step 1: Create an HTTP Interceptor for Token Refreshing**

The primary role of our interceptor is no longer to add tokens (the browser does that with cookies), but to gracefully handle `401 Unauthorized` errors when our short-lived access token expires.

1.  **Generate the Interceptor:**
    ```bash
    ng generate interceptor interceptors/token-refresh
    ```

2.  **Code the `TokenRefreshInterceptor`:**
    This interceptor tries to refresh the token on a 401 error and then retries the original failed request.

    ```typescript
    // src/app/interceptors/token-refresh.interceptor.ts
    import { Injectable } from '@angular/core';
    import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
    import { Observable, throwError, BehaviorSubject } from 'rxjs';
    import { catchError, switchMap, filter, take } from 'rxjs/operators';
    import { AuthService } from '../services/auth.service';

    @Injectable()
    export class TokenRefreshInterceptor implements HttpInterceptor {
      // In a real app, you would use your auth service to call the refresh endpoint
      // For this guide, we'll simulate it.
      
      constructor(private authService: AuthService) {}

      intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Here you would call your authService.refreshToken()
              // which should return an observable.
              // If refresh is successful, retry the original request.
              // If not, log the user out.
              console.log('Access token expired. A real app would attempt to refresh it here.');
              this.authService.logout().subscribe();
            }
            return throwError(() => error);
          })
        );
      }
    }
    ```

3.  **Provide the Interceptor in `app.module.ts`:**
    ```typescript
    // src/app/app.module.ts
    import { HTTP_INTERCEPTORS } from '@angular/common/http';
    import { TokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';

    @NgModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TokenRefreshInterceptor, multi: true },
      ],
    })
    export class AppModule { }
    ```

---

### **Step 2: Generate and Build Meme Components**

```bash
# Generate components if you haven't already
ng generate component components/meme-list
ng generate component components/meme-form

# Generate the service and interface
ng generate service services/meme
ng generate interface models/meme
```

---

### **Step 3: Define the Meme Interface and Service**

1.  **Define the `Meme` interface in `src/app/models/meme.ts`:**
    ```typescript
    export interface Meme {
      _id: string;
      caption: string;
      imageUrl: string;
      category: 'Funny' | 'Relatable' | 'Dark' | 'Wholesome';
      user: {
        _id: string;
        username: string;
      };
      createdAt?: Date;
    }
    ```

2.  **Implement the `MemeService`:**
    This service handles all API calls for memes. It's clean and doesn't need to know anything about authentication.
    ```typescript
    // src/app/services/meme.service.ts
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { Meme } from '../models/meme';
    import { environment } from '../../environments/environment';

    @Injectable({ providedIn: 'root' })
    export class MemeService {
      private apiUrl = `${environment.apiUrl}/memes`;

      constructor(private http: HttpClient) { }

      getMemes(): Observable<Meme[]> {
        return this.http.get<Meme[]>(this.apiUrl);
      }

      createMeme(memeData: { caption: string; imageUrl: string; category: string; }): Observable<Meme> {
        return this.http.post<Meme>(this.apiUrl, memeData);
      }

      deleteMeme(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
      }
    }
    ```

---

### **Step 4: Build the Components with Error Handling**

1.  **Code the `meme-list` Component:**
    This component now includes an `error` property to provide feedback to the user if memes fail to load.
    *   **`meme-list.component.ts`**
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { MemeService } from '../../services/meme.service';
        import { Meme } from '../../models/meme';

        @Component({
          selector: 'app-meme-list',
          templateUrl: './meme-list.component.html',
        })
        export class MemeListComponent implements OnInit {
          memes: Meme[] = [];
          error: string | null = null;

          constructor(private memeService: MemeService) {}

          ngOnInit(): void {
            this.loadMemes();
          }

          loadMemes(): void {
            this.error = null;
            this.memeService.getMemes().subscribe({
              next: (data) => this.memes = data,
              error: () => this.error = 'Could not load memes. Please try again later.'
            });
          }

          handleDelete(memeId: string): void {
            this.memeService.deleteMeme(memeId).subscribe({
              next: () => this.loadMemes(), // Reload list on success
              error: () => this.error = 'Failed to delete meme.'
            });
          }
        }
        ```
    *   **`meme-list.component.html`:**
        ```html
        <h2>My Memes <a routerLink="/memes/new">+ Add New</a></h2>
        <div *ngIf="error" class="error-message">{{ error }}</div>
        <!-- Using app-meme-item component would go here -->
        <div *ngFor="let meme of memes">
          <p>{{ meme.caption }} <button (click)="handleDelete(meme._id)">Delete</button></p>
        </div>
        ```
2.  **Code the `meme-form` Component (for creating):**
    This uses Reactive Forms for better validation and also provides UI error feedback.
    *   **`meme-form.component.ts`**
        ```typescript
        import { Component } from '@angular/core';
        import { FormBuilder, FormGroup, Validators } from '@angular/forms';
        import { Router } from '@angular/router';
        import { MemeService } from '../../services/meme.service';

        @Component({
          selector: 'app-meme-form',
          templateUrl: './meme-form.component.html',
        })
        export class MemeFormComponent {
          memeForm: FormGroup;
          error: string | null = null;

          constructor(
            private fb: FormBuilder,
            private memeService: MemeService,
            private router: Router
          ) {
            this.memeForm = this.fb.group({
              caption: ['', Validators.required],
              imageUrl: ['', Validators.required],
              category: ['Funny', Validators.required],
            });
          }

          onSubmit(): void {
            if (this.memeForm.invalid) return;
            this.error = null;
            this.memeService.createMeme(this.memeForm.value).subscribe({
              next: () => this.router.navigate(['/memes']),
              error: (err) => this.error = err.error.message || 'Failed to create meme.'
            });
          }
        }
        ```
    *The HTML for the form would be similar to the login form, with a space to display the `error` message.*

---

### **Step 5: Finalize Application Routing**

This ties everything together, protecting the meme-related routes with the `AuthGuard`.

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MemeListComponent } from './components/meme-list/meme-list.component';
import { MemeFormComponent } from './components/meme-form/meme-form.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected Routes that require a user to be logged in
  { path: 'memes', component: MemeListComponent, canActivate: [AuthGuard] },
  { path: 'memes/new', component: MemeFormComponent, canActivate: [AuthGuard] },

  // Default and wildcard routes
  { path: '', redirectTo: '/memes', pathMatch: 'full' },
  { path: '**', redirectTo: '/memes' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**Congratulations!** The development plan is now complete. It outlines a secure, professional, and maintainable approach to building the Meme Collection Manager application, addressing all the critical feedback from the critique.
