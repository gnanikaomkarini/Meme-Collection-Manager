# Meme Collection Manager - Full Stack Development Experiments (Part 3)

**Roll No:** 23WH1A0532  
**Date:** April 13, 2026  
**Project:** Meme Collection Manager - Meme Sharing and Management Platform

---

## Experiment 11: Develop the Meme Collection Manager web application to manage meme and user information using Express and Angular

### AIM
Develop the Meme Collection Manager web application to manage meme and user information using Express and Angular.

### Description
This experiment develops a web application for managing meme-related information using Express and Angular. Meme Collection Manager supports Google OAuth login, dashboard access, meme viewing, and meme creation through connected backend and frontend modules. The Express server handles routes and APIs, while Angular provides the interactive user interface. It demonstrates a complete full-stack application structure for meme management.

### Source Code

**File: `backend/server.js` (Express Server Setup)**

```javascript
const dotenv = require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./config/passport');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const memeRoutes = require('./routes/meme.routes');
const uploadRoutes = require('./routes/upload.routes');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectDB();

const app = express();
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next(); 
});
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DATABASE_NAME,
        touchAfter: 24 * 3600
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/memes', memeRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR", message: err.message || "Something went wrong" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Gnanika's is running on port ${process.env.PORT || 3000}. Adios Amigos!`);
});
```

**File: `frontend/src/app/app.routes.ts` (Angular Routes)**

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateMemeComponent } from './components/create-meme/create-meme.component';
import { MemeDetailComponent } from './components/meme-detail/meme-detail.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  {
    path: 'create',
    component: CreateMemeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: CreateMemeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'meme/:id',
    component: MemeDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

### OUTPUT
Express backend running:
```
Gnanika's is running on port 3000. Adios Amigos!
MongoDB connected
```

Angular frontend with routes:
- `/` - Dashboard (protected)
- `/login` - Login page (public)
- `/auth/callback` - OAuth callback
- `/create` - Create meme (protected)
- `/edit/:id` - Edit meme (protected)
- `/meme/:id` - Meme details (protected)

---

## Experiment 12: Implement a like and comment decision workflow in Angular for meme interactions

### AIM
Implement a like and comment decision workflow in Angular for meme interactions in the Meme Collection Manager.

### Description
This experiment presents an Angular-based decision workflow similar to social media interactions. In Meme Collection Manager, users can like/unlike memes and add/remove comments from the meme detail page. Each decision updates the state of the meme in the database and interface. It shows how action-based state changes can be implemented in an Angular application.

### Source Code

**File: `frontend/src/app/components/meme-detail/meme-detail.component.ts`**

```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MemeService } from '../../services/meme';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div *ngIf="isLoadingMeme()" class="loading">
      <mat-spinner></mat-spinner>
    </div>

    <div *ngIf="!isLoadingMeme() && meme()" class="meme-detail">
      <button class="back-button" (click)="router.navigate(['/'])">
        <mat-icon>arrow_back</mat-icon>
        Back
      </button>

      <div class="meme-content">
        <img [src]="meme()!.imageUrl" [alt]="meme()!.title" />
        
        <div class="meme-info">
          <h1>{{ meme()!.title }}</h1>
          <p class="caption">{{ meme()!.caption }}</p>
          <p class="owner">by {{ meme()!.owner.displayName }}</p>
          <p class="category">Category: {{ meme()!.category }}</p>

          <div class="interactions">
            <button 
              mat-raised-button
              (click)="toggleLike()"
              [color]="isLikedByCurrentUser() ? 'primary' : ''"
            >
              <mat-icon>{{ isLikedByCurrentUser() ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
              Like ({{ meme()!.likes.length }})
            </button>

            <span class="comment-count">
              <mat-icon>comment</mat-icon>
              {{ meme()!.comments.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="comments-section">
        <h2>Comments ({{ meme()!.comments.length }})</h2>

        <div class="add-comment">
          <input
            [(ngModel)]="commentText"
            placeholder="Add a comment..."
            class="comment-input"
          />
          <button
            mat-raised-button
            color="primary"
            (click)="addComment()"
            [disabled]="isSubmittingComment() || !commentText.trim()"
          >
            {{ isSubmittingComment() ? 'Posting...' : 'Post' }}
          </button>
        </div>

        <div class="comments-list">
          <div *ngFor="let comment of meme()!.comments" class="comment">
            <div class="comment-header">
              <strong>{{ comment.author.displayName }}</strong>
              <span class="comment-date">{{ comment.createdAt | date:'short' }}</span>
            </div>
            <p>{{ comment.text }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meme-detail {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .back-button {
      margin-bottom: 20px;
    }

    .meme-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 40px;
    }

    .meme-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .meme-info h1 {
      margin: 0 0 10px;
      font-size: 28px;
    }

    .caption {
      font-size: 16px;
      color: #666;
      margin: 5px 0;
    }

    .owner {
      font-size: 14px;
      color: #999;
    }

    .interactions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      align-items: center;
    }

    .comments-section {
      border-top: 1px solid #eee;
      padding-top: 30px;
    }

    .add-comment {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }

    .comment-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }

    .comment {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .comment-date {
      font-size: 12px;
      color: #999;
    }
  `]
})
export class MemeDetailComponent implements OnInit {
  meme = signal<any>(null);
  commentText = '';
  isLoadingMeme = signal(true);
  isSubmittingComment = signal(false);
  
  memeService = inject(MemeService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadMeme(params['id']);
    });
  }

  loadMeme(id: string) {
    this.memeService.getMeme(id).subscribe({
      next: (meme) => {
        this.meme.set(meme);
        this.isLoadingMeme.set(false);
      },
      error: () => this.isLoadingMeme.set(false)
    });
  }

  toggleLike() {
    if (!this.meme()) return;
    
    this.memeService.likeMeme(this.meme()._id).subscribe({
      next: (updated) => this.meme.set(updated)
    });
  }

  addComment() {
    if (!this.commentText.trim() || !this.meme()) return;

    this.isSubmittingComment.set(true);
    this.memeService.addComment(this.meme()._id, this.commentText).subscribe({
      next: (updated) => {
        this.meme.set(updated);
        this.commentText = '';
        this.isSubmittingComment.set(false);
      },
      error: () => this.isSubmittingComment.set(false)
    });
  }

  isLikedByCurrentUser(): boolean {
    if (!this.meme() || !this.currentUser) return false;
    return this.meme().likes.some((like: any) => 
      like._id === this.currentUser._id
    );
  }
}
```

### OUTPUT
User likes a meme:
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "title": "When you understand the code",
    "likes": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "comments": []
}
```

User adds comment:
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "title": "When you understand the code",
    "likes": ["507f1f77bcf86cd799439011"],
    "comments": [
        {
            "_id": "507f1f77bcf86cd799439015",
            "author": {
                "_id": "507f1f77bcf86cd799439011",
                "displayName": "John Doe",
                "profileImage": "https://lh3.googleusercontent.com/..."
            },
            "text": "This is hilarious!",
            "createdAt": "2026-04-13T10:00:00.000Z"
        }
    ]
}
```

---

## Experiment 13: Develop the Meme Collection Manager image upload and display system

### AIM
Develop the Meme Collection Manager image upload and display system using Angular and Express.

### Description
This experiment develops an image upload system using Angular and Express. Users can upload image files for their memes through a form, with client-side validation and progress tracking. The backend stores images in the filesystem and serves them as static files. The frontend displays uploaded images as previews, replacing the upload box once an image is selected. It represents a core functionality of the entire project.

### Source Code

**File: `backend/middleware/upload.js`**

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
```

**File: `frontend/src/app/components/create-meme/create-meme.component.ts` (Image Upload Section)**

```typescript
export class CreateMemeComponent implements OnInit {
  form!: FormGroup;
  isUploading = signal(false);
  uploadError = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('File is too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Please select a valid image file.');
      return;
    }

    this.uploadError.set(null);
    this.isUploading.set(true);

    this.memeService.uploadImage(file).subscribe({
      next: (response) => {
        this.form.get('imageUrl')?.setValue(response.imageUrl);
        this.isUploading.set(false);
      },
      error: (error) => {
        this.uploadError.set(error.error?.message || 'Failed to upload image');
        this.isUploading.set(false);
      }
    });
  }

  clearImage() {
    this.form.get('imageUrl')?.setValue('');
    this.uploadError.set(null);
  }
}
```

### OUTPUT
Image uploaded successfully:
```json
{
    "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3135852b0f97c4d7f.webp",
    "filename": "image-1776086308513-69dce8e3135852b0f97c4d7f.webp",
    "size": 245632
}
```

Upload status display:
- Progress bar shows during upload
- Preview image displays after successful upload
- Upload box hidden when image selected
- Clear button available to remove image and re-upload

---

## Experiment 14: Build the Meme Collection Manager Angular application using reusable components and routing

### AIM
Build the Meme Collection Manager Angular application using reusable components and routing between pages.

### Description
This experiment demonstrates the use of Angular components and routing across multiple web pages. Meme Collection Manager includes separate pages for login, dashboard, create/edit meme, and meme detail views. Angular Router is used to navigate between pages, and route guards restrict access to authenticated users. It explains how component-based design and routing improve the structure of a multi-page frontend application.

### Source Code

**File: `frontend/src/app/app.ts` (Root Component)**

```typescript
import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="authService.isLoading()" class="loading-overlay">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading...</p>
    </div>
    <router-outlet *ngIf="!authService.isLoading()"></router-outlet>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f5f5f5;
      gap: 20px;
    }
  `]
})
export class App {
  protected readonly title = signal('meme-app');
  authService = inject(AuthService);
}
```

**File: `frontend/src/app/guards/auth.guard.ts` (Route Guards)**

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (!authService.isLoading()) {
        if (authService.isAuthenticated()) {
          resolve(true);
        } else {
          router.navigate(['/login']);
          resolve(false);
        }
      } else {
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (!authService.isLoading()) {
        if (!authService.isAuthenticated()) {
          resolve(true);
        } else {
          router.navigate(['/']);
          resolve(false);
        }
      } else {
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};
```

**File: `frontend/src/app/components/dashboard/dashboard.component.ts`**

```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MemeService } from '../../services/meme';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Meme Collection Manager</span>
      <span class="spacer"></span>
      <button mat-button>{{ currentUser()?.displayName }}</button>
      <button mat-button (click)="logout()">Logout</button>
    </mat-toolbar>

    <div class="dashboard">
      <div class="header">
        <h1>Meme Gallery</h1>
        <button mat-raised-button color="primary" routerLink="/create">
          <mat-icon>add</mat-icon>
          Create Meme
        </button>
      </div>

      <div *ngIf="isLoading()" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!isLoading()" class="meme-grid">
        <mat-card *ngFor="let meme of memes()" class="meme-card" [routerLink]="['/meme', meme._id]">
          <img [src]="meme.imageUrl" [alt]="meme.title" />
          <mat-card-content>
            <h3>{{ meme.title }}</h3>
            <p>{{ meme.caption }}</p>
            <div class="stats">
              <span><mat-icon>thumb_up</mat-icon>{{ meme.likes.length }}</span>
              <span><mat-icon>comment</mat-icon>{{ meme.comments.length }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    mat-toolbar {
      margin-bottom: 20px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .meme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .meme-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .meme-card:hover {
      transform: translateY(-5px);
    }

    .meme-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .stats {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  memes = signal<any[]>([]);
  isLoading = signal(true);
  currentUser = signal<any>(null);

  memeService = inject(MemeService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.currentUser.set(this.authService.currentUser());
    this.loadMemes();
  }

  loadMemes() {
    this.memeService.getAllMemes().subscribe({
      next: (memes) => {
        this.memes.set(memes);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
```

### OUTPUT
Application component structure:
- Root App component with loading overlay
- Dashboard component with meme grid
- Login component for authentication
- Create/Edit meme component for meme creation
- Meme detail component for viewing meme with interactions
- Auth callback component for OAuth handling

Routes configured:
- `/` → Dashboard (protected)
- `/login` → Login (public)
- `/auth/callback` → OAuth Callback
- `/create` → Create Meme (protected)
- `/edit/:id` → Edit Meme (protected)
- `/meme/:id` → Meme Details (protected)

Component-based architecture allows reusability and maintainability.

---

## 🎓 Project Summary

### Complete Technology Stack
**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Passport.js & Google OAuth
- Express-session with MongoDB Store
- Multer for file uploads

**Frontend:**
- Angular 17+ with standalone components
- Angular Router & Guards
- Angular Material UI
- TypeScript with signals
- RxJS for reactive programming

### All Features Implemented
✅ Google OAuth 2.0 authentication
✅ Session persistence with MongoDB store
✅ Complete CRUD operations for memes
✅ Image upload with validation
✅ Like/Unlike functionality
✅ Comment system
✅ Meme gallery with search
✅ Route guards and protected routes
✅ Responsive UI with Angular Material
✅ Real-time state management with signals

### Key Learning Outcomes
1. Full-stack application architecture
2. RESTful API design with proper HTTP semantics
3. MongoDB schema design with relationships
4. Google OAuth 2.0 integration
5. Session management and security
6. Angular component-based development
7. Reactive programming with signals
8. File upload handling and storage
9. Route protection and authentication flows
10. Frontend-backend integration patterns

### Future Enhancement Ideas
- User profiles and follow system
- Meme sharing and social features
- Advanced search and filtering
- Meme ratings and reviews
- Trending memes algorithm
- Email notifications
- Mobile responsive design
- Admin dashboard and analytics
- Cloud storage integration (AWS S3)
- Real-time notifications with WebSockets

---

**🎉 Congratulations! You have completed all 14 experiments for the Meme Collection Manager Full Stack Development project.**

---

**End of Part 3 - Complete Experiments Documentation**
