# Development Plan: 05 - Frontend Meme CRUD

This final guide covers the implementation of the core CRUD (Create, Read, Update, Delete) features for memes in the Angular frontend. We will create an `HttpInterceptor` to automatically attach authentication tokens to our API requests.

**Note:** All commands and paths are relative to the `frontend/meme-app` directory.

---

### **Step 1: Create an HTTP Interceptor for JWT**

An `HttpInterceptor` is a powerful Angular feature that can intercept outgoing HTTP requests and modify them. We will use it to automatically add the JWT to the headers of every request sent to our backend API, which is much cleaner than adding it manually in every service function.

1.  **Generate the Interceptor:**
    ```bash
    ng generate interceptor interceptors/auth
    ```
    When asked "Would you like to provide it in the root `app.module.ts`?", answer **No**. We will provide it manually.

2.  **Code the `AuthInterceptor`:**
    This interceptor fetches the token from `AuthService` and, if it exists, clones the request to add an `Authorization` header before sending it on its way.

    ```typescript
    // src/app/interceptors/auth.interceptor.ts
    import { Injectable } from '@angular/core';
    import {
      HttpRequest,
      HttpHandler,
      HttpEvent,
      HttpInterceptor
    } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { AuthService } from '../services/auth.service';

    @Injectable()
    export class AuthInterceptor implements HttpInterceptor {
      constructor(private authService: AuthService) {}

      intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.authService.getToken();

        // If a token exists, clone the request and add the authorization header
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        return next.handle(request);
      }
    }
    ```

3.  **Provide the Interceptor in `app.module.ts`:**
    You must tell your application to use this interceptor for all outgoing HTTP requests.

    ```typescript
    // src/app/app.module.ts
    import { HTTP_INTERCEPTORS } from '@angular/common/http'; // Import this
    import { AuthInterceptor } from './interceptors/auth.interceptor'; // Import your interceptor

    @NgModule({
      // ...
      providers: [
        // Add this providers array
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    ```

---

### **Step 2: Generate Meme Components and Service**

Now, create the UI components and the service that will manage meme data.

```bash
# Generate components for the list, form, and individual items
ng generate component components/meme-list
ng generate component components/meme-form
ng generate component components/meme-item

# Generate the service to handle API calls for memes
ng generate service services/meme

# Generate an interface for the Meme data structure
ng generate interface models/meme
```

---

### **Step 3: Define the Meme Interface and Service**

1.  **Define the `Meme` interface:**
    ```typescript
    // src/app/models/meme.ts
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
      updatedAt?: Date;
    }
    ```

2.  **Implement the `MemeService`:**
    This service will handle all API calls to the `/api/memes` endpoints. Thanks to our interceptor, we don't need to worry about adding the token here.

    ```typescript
    // src/app/services/meme.service.ts
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { Meme } from '../models/meme';

    @Injectable({
      providedIn: 'root'
    })
    export class MemeService {
      private apiUrl = 'http://localhost:3000/api/memes';

      constructor(private http: HttpClient) { }

      getMemes(): Observable<Meme[]> {
        return this.http.get<Meme[]>(this.apiUrl);
      }

      createMeme(memeData: Partial<Meme>): Observable<Meme> {
        return this.http.post<Meme>(this.apiUrl, memeData);
      }

      updateMeme(id: string, memeData: Partial<Meme>): Observable<Meme> {
        return this.http.put<Meme>(`${this.apiUrl}/${id}`, memeData);
      }

      deleteMeme(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
      }
    }
    ```

---

### **Step 4: Build the Meme Components**

1.  **Code the `meme-list` Component:**
    This component fetches all memes and displays them using the `meme-item` component.

    *   **`meme-list.component.html`**
        ```html
        <h2>My Memes <a routerLink="/memes/new" class="add-new-button">+ Add New</a></h2>
        <div class="meme-gallery">
          <app-meme-item
            *ngFor="let meme of memes"
            [meme]="meme"
            (onDelete)="handleDelete($event)">
          </app-meme-item>
        </div>
        <div *ngIf="memes.length === 0">Your gallery is empty. Add a meme to get started!</div>
        ```
    *   **`meme-list.component.ts`**
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { MemeService } from '../../services/meme.service';
        import { Meme } from '../../models/meme';

        @Component({
          selector: 'app-meme-list',
          templateUrl: './meme-list.component.html'
        })
        export class MemeListComponent implements OnInit {
          memes: Meme[] = [];

          constructor(private memeService: MemeService) { }

          ngOnInit(): void {
            this.loadMemes();
          }

          loadMemes(): void {
            this.memeService.getMemes().subscribe(data => this.memes = data);
          }

          handleDelete(memeId: string): void {
            this.memeService.deleteMeme(memeId).subscribe(() => {
              // On successful delete, reload the memes
              this.loadMemes();
            });
          }
        }
        ```

2.  **Code the `meme-item` Component:**
    This "dumb" component just receives a meme and displays it. It emits an event when the delete button is clicked.

    *   **`meme-item.component.html`**
        ```html
        <div class="meme-card">
          <img [src]="meme.imageUrl" [alt]="meme.caption">
          <div class="meme-info">
            <p>{{ meme.caption }}</p>
            <span>Category: {{ meme.category }}</span>
            <div class="actions">
              <!-- Edit link will be added later -->
              <!-- <a [routerLink]="['/memes/edit', meme._id]">Edit</a> -->
              <button (click)="deleteMeme()">Delete</button>
            </div>
          </div>
        </div>
        ```
    *   **`meme-item.component.ts`**
        ```typescript
        import { Component, Input, Output, EventEmitter } from '@angular/core';
        import { Meme } from '../../models/meme';

        @Component({
          selector: 'app-meme-item',
          templateUrl: './meme-item.component.html'
        })
        export class MemeItemComponent {
          @Input() meme!: Meme;
          @Output() onDelete = new EventEmitter<string>();

          deleteMeme(): void {
            if (confirm('Are you sure you want to delete this meme?')) {
              this.onDelete.emit(this.meme._id);
            }
          }
        }
        ```

3.  **Code the `meme-form` Component:**
    This form is for creating new memes. (The logic for editing can be added later by pre-filling the form).

    *   **`meme-form.component.html` & `meme-form.component.ts`:**
        These are the same as in the original `00_Overall_Plan.md`. Use the code from there to create a form that calls `memeService.createMeme()` on submit and navigates back to the list.

---

### **Step 5: Finalize Routing**

Update your routing module to include the new meme-related routes and protect them with the `AuthGuard`.

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
  
  // Protected Routes
  { path: 'memes', component: MemeListComponent, canActivate: [AuthGuard] },
  { path: 'memes/new', component: MemeFormComponent, canActivate: [AuthGuard] },
  // { path: 'memes/edit/:id', component: MemeFormComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/memes', pathMatch: 'full' }, // Default to memes list
  { path: '**', redirectTo: '/memes' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**Congratulations!** You now have a complete, detailed, step-by-step guide to building the entire Meme Collection Manager application, from backend setup to a secure, functional frontend.
