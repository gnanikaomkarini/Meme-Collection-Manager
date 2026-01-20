# Development Plan: 05 - Frontend CRUD, Polish, and Finalization

This guide elevates the frontend to a polished application by implementing a token refresh mechanism, loading indicators, the "Edit" feature, and proper component architecture.

---

### **Step 1: Implement the Token Refresh Interceptor**

(This step, including the `AuthService` update and the `TokenRefreshInterceptor` code, remains the same as the previous version of this guide. It is a critical piece for seamless session management).

---

### **Step 2: Create the `MemeItem` Child Component**

To create a clean and reusable architecture, we'll create a dedicated component to display a single meme.

1.  **Generate the component:**
    ```bash
    ng generate component components/meme-item
    ```
2.  **Code the `meme-item.component.ts`:**
    This "presentational" component takes a `meme` as input and emits an event when the delete button is clicked. It doesn't know *how* to delete a meme, it just reports the user's intent to its parent.
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

### **Step 3: Update the `MemeListComponent` to Act as a Parent**

The `meme-list` component is now a "container" component. Its job is to fetch data and coordinate child components.

1.  **Update `meme-list.component.html` to use the new child component:**
    The logic is much cleaner. It loops over `app-meme-item` and listens for the `delete` event.
    ```html
    <h2>My Memes <a routerLink="/memes/new">+ Add New</a></h2>
    <div *ngIf="isLoading">Loading memes...</div>
    <div *ngIf="error" class.="error-message">{{ error }}</div>
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

### **Step 4: Implement the "Edit" Feature**

(This step, which includes refactoring the `MemeFormComponent` and `MemeService`, remains the same as the previous version of this guide).

### **Step 5: Finalize Application Routing**

(This step, showing the final `app-routing.module.ts` with the edit route, also remains the same).

This completes the frontend architecture, creating a more maintainable and scalable structure by properly separating container and presentational components.
