# Development Plan: 05 - Frontend CRUD, Polish, and Finalization

This final guide elevates the frontend from a prototype to a polished application. It implements a fully functional token refresh mechanism, adds loading indicators, and builds the "Edit" feature to complete the CRUD lifecycle.

---

### **Step 1: Implement a Fully Functional Token Refresh Interceptor**

This interceptor provides a seamless user experience by automatically refreshing expired access tokens without interrupting the user.

1.  **Update the `AuthService` with a `refreshToken` method:**
    ```typescript
    // src/app/services/auth.service.ts
    // ...
    export class AuthService {
      // ...
      refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/refresh-token`, {});
      }
      // ...
    }
    ```
2.  **Code the `TokenRefreshInterceptor` with full RxJS logic:**
    ```typescript
    // src/app/interceptors/token-refresh.interceptor.ts
    import { Injectable } from '@angular/core';
    import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
    import { Observable, throwError, BehaviorSubject } from 'rxjs';
    import { catchError, switchMap, filter, take } from 'rxjs/operators';
    import { AuthService } from '../services/auth.service';

    @Injectable()
    export class TokenRefreshInterceptor implements HttpInterceptor {
      private isRefreshing = false;
      private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

      constructor(private authService: AuthService) {}

      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
          catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(req, next);
            }
            return throwError(() => error);
          })
        );
      }

      private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          return this.authService.refreshToken().pipe(
            switchMap((token: any) => {
              this.isRefreshing = false;
              this.refreshTokenSubject.next(token);
              // The backend automatically sets the new cookie, so we just retry the original request
              return next.handle(request);
            }),
            catchError((err) => {
              this.isRefreshing = false;
              this.authService.logout().subscribe();
              return throwError(() => err);
            })
          );
        } else {
          return this.refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(() => next.handle(request))
          );
        }
      }
    }
    ```
3.  **Provide the interceptor in `app.module.ts`** (if not already done).

---

### **Step 2: Add "Edit" Functionality and Loading Indicators**

We'll refactor the `MemeFormComponent` to handle both creating and editing, and add `isLoading` flags for better UX.

1.  **Update `MemeService` with `getMemeById` and `updateMeme`:**
    ```typescript
    // src/app/services/meme.service.ts
    // ...
    export class MemeService {
      // ... (getMemes, createMeme, deleteMeme)
      getMemeById(id: string): Observable<Meme> {
        return this.http.get<Meme>(`${this.apiUrl}/${id}`);
      }
      updateMeme(id: string, memeData: Partial<Meme>): Observable<Meme> {
        return this.http.put<Meme>(`${this.apiUrl}/${id}`, memeData);
      }
    }
    ```
2.  **Refactor `MemeFormComponent` for Create and Edit modes:**
    *   **`meme-form.component.ts`**
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { FormBuilder, FormGroup, Validators } from '@angular/forms';
        import { ActivatedRoute, Router } from '@angular/router';
        import { MemeService } from '../../services/meme.service';
        import { finalize } from 'rxjs/operators';

        @Component({ selector: 'app-meme-form', templateUrl: './meme-form.component.html' })
        export class MemeFormComponent implements OnInit {
          memeForm: FormGroup;
          error: string | null = null;
          isLoading = false;
          editMode = false;
          private memeId: string | null = null;

          constructor(
            private fb: FormBuilder,
            private memeService: MemeService,
            private router: Router,
            private route: ActivatedRoute
          ) { /* ... form initialization ... */ }

          ngOnInit(): void {
            this.memeId = this.route.snapshot.paramMap.get('id');
            if (this.memeId) {
              this.editMode = true;
              this.isLoading = true;
              this.memeService.getMemeById(this.memeId).pipe(
                finalize(() => this.isLoading = false)
              ).subscribe(meme => {
                this.memeForm.patchValue(meme);
              });
            }
          }

          onSubmit(): void {
            if (this.memeForm.invalid) return;
            this.isLoading = true;
            this.error = null;

            const operation = this.editMode
              ? this.memeService.updateMeme(this.memeId!, this.memeForm.value)
              : this.memeService.createMeme(this.memeForm.value);

            operation.pipe(
              finalize(() => this.isLoading = false)
            ).subscribe({
              next: () => this.router.navigate(['/memes']),
              error: (err) => this.error = err.error.message || 'An error occurred.'
            });
          }
        }
        ```
    *   **`meme-form.component.html`**
        ```html
        <h2>{{ editMode ? 'Edit' : 'Create' }} Meme</h2>
        <div *ngIf="isLoading">Loading...</div>
        <form *ngIf="!isLoading" [formGroup]="memeForm" (ngSubmit)="onSubmit()">
          <!-- ... form fields ... -->
          <div *ngIf="error" class="error-message">{{ error }}</div>
          <button type="submit" [disabled]="memeForm.invalid || isLoading">
            {{ editMode ? 'Update' : 'Create' }}
          </button>
        </form>
        ```
3.  **Update `meme-list.component.html` to include an Edit link:**
    ```html
    <!-- Inside the *ngFor loop for memes -->
    <a [routerLink]="['/memes/edit', meme._id]">Edit</a>
    ```

---

### **Step 3: Finalize Application Routing**

Update the routing module to include the new edit route.

```typescript
// src/app/app-routing.module.ts
// ... imports
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected Routes
  { path: 'memes', component: MemeListComponent, canActivate: [AuthGuard] },
  { path: 'memes/new', component: MemeFormComponent, canActivate: [AuthGuard] },
  { path: 'memes/edit/:id', component: MemeFormComponent, canActivate: [AuthGuard] }, // New Edit Route

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

This concludes the frontend implementation. You now have a polished and resilient user interface for creating, viewing, and editing memes, complete with automatic session management and user-friendly feedback.