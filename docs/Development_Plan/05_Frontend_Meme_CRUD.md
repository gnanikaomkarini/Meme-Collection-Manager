# Development Plan: 05 - Frontend CRUD, Polish, and Finalization

This guide elevates the frontend to a polished application by implementing loading indicators, the "Edit" feature, and proper component architecture. With Google OAuth, we no longer need to manage tokens on the client, which simplifies the process.

---

### **A Note on Session Management**

Previously, this guide included a step for a "Token Refresh Interceptor." This is **no longer needed**. Session management is now handled automatically via the secure, `httpOnly` session cookie that the browser sends with every API request. There are no client-side tokens to refresh.

---

### **Step 1: Create the `MemeItem` Child Component**

To create a clean and reusable architecture, we'll create a dedicated component to display a single meme.

1.  **Generate the component:**
    ```bash
    ng generate component components/meme-item
    ```
2.  **Code the `meme-item.component.ts`:**
    This "presentational" component takes a `meme` as input and emits events when the user wants to edit or delete it.
    ```typescript
    import { Component, Input, Output, EventEmitter } from '@angular/core';
    import { Meme } from '../../models/meme'; // Assuming you have a meme model

    @Component({
      selector: 'app-meme-item',
      templateUrl: './meme-item.component.html',
    })
    export class MemeItemComponent {
      @Input() meme!: Meme;
      @Output() delete = new EventEmitter<string>();

      onDeleteClick(): void {
        if (confirm('Are you sure you want to delete this meme?')) {
          this.delete.emit(this.meme._id);
        }
      }
    }
    ```
3.  **Code the `meme-item.component.html`:**
    This is the template for a single card in our gallery.
    ```html
    <div class="meme-card">
      <img [src]="meme.imageUrl" [alt]="meme.caption">
      <div class="meme-info">
        <p>{{ meme.caption }}</p>
        <span>Category: {{ meme.category }}</span>
        <div class="actions">
          <a [routerLink]="['/memes/edit', meme._id]">Edit</a>
          <button (click)="onDeleteClick()">Delete</button>
        </div>
      </div>
    </div>
    ```

---

### **Step 2: Update the `MemeListComponent` to Act as a Parent**

The `meme-list` component is now a "container" component. Its job is to fetch data and coordinate the child components.

1.  **Update `meme-list.component.html` to use the new child component:**
    The logic is much cleaner. It loops over `app-meme-item` and listens for the `delete` event.
    ```html
    <h2>My Memes <a routerLink="/memes/new">+ Add New</a></h2>
    <div *ngIf="isLoading">Loading memes...</div>
    <div *ngIf="error" class="error-message">{{ error }}</div>
    <div *ngIf="!isLoading && !error" class="meme-gallery">
      <app-meme-item
        *ngFor="let meme of memes"
        [meme]="meme"
        (delete)="handleDelete($event)">
      </app-meme-item>
      <p *ngIf="memes.length === 0">Your gallery is empty. Add a meme!</p>
    </div>
    ```
2.  **Update `meme-list.component.ts`:**
    The `handleDelete` method now receives the ID from the child component's event. The loading indicator logic is also included here.
    ```typescript
    import { Component, OnInit } from '@angular/core';
    import { MemeService } from '../../services/meme.service';
    import { Meme } from '../../models/meme';
    import { finalize } from 'rxjs/operators';

    @Component({
      selector: 'app-meme-list',
      templateUrl: './meme-list.component.html',
    })
    export class MemeListComponent implements OnInit {
      memes: Meme[] = [];
      error: string | null = null;
      isLoading = false;

      constructor(private memeService: MemeService) {}

      ngOnInit(): void {
        this.loadMemes();
      }

      loadMemes(): void {
        this.isLoading = true;
        this.error = null;
        this.memeService.getMemes().pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (data) => this.memes = data,
          error: () => this.error = 'Could not load memes. Please try again.'
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

---

### **Step 3: Implement the "Edit" Feature**

We'll refactor the `MemeFormComponent` to handle both creating and editing, and add `isLoading` flags for better UX.

1.  **Update `MemeService` with `getMemeById` and `updateMeme`:**
    ```typescript
    // src/app/services/meme.service.ts
    import { Meme } from '../models/meme';
    import { Observable } from 'rxjs';
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
          ) { 
            this.memeForm = this.fb.group({
              caption: ['', Validators.required],
              imageUrl: ['', Validators.required],
              category: ['', Validators.required]
            });
          }

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
          <!-- Fields for caption, imageUrl, category -->
          <div *ngIf="error" class="error-message">{{ error }}</div>
          <button type="submit" [disabled]="memeForm.invalid || isLoading">
            {{ editMode ? 'Update' : 'Create' }}
          </button>
        </form>
        ```
3.  **Update `meme-list.component.html` to include an Edit link:**
    The `meme-item.component.html` already contains the `[routerLink]`, so this part is covered by Step 1.


### **Step 4: Finalize Application Routing**

Update the routing module to include the protected routes for creating and editing memes, guarded by the `AuthGuard`.

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MemeListComponent } from './components/meme-list/meme-list.component';
import { MemeFormComponent } from './components/meme-form/meme-form.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Public route
  { path: '', component: HomeComponent },

  // Protected Routes
  { path: 'memes', component: MemeListComponent, canActivate: [AuthGuard] },
  { path: 'memes/new', component: MemeFormComponent, canActivate: [AuthGuard] },
  { path: 'memes/edit/:id', component: MemeFormComponent, canActivate: [AuthGuard] },

  // Wildcard route
  { path: '**', redirectTo: '/memes' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

This completes the frontend architecture, creating a more maintainable and scalable structure by properly separating container and presentational components. The removal of manual token management greatly simplifies the overall state logic.
