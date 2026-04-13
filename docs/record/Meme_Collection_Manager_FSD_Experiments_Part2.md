# Meme Collection Manager - Full Stack Development Experiments (Part 2)

**Roll No:** 23WH1A0532  
**Date:** April 13, 2026  
**Project:** Meme Collection Manager - Meme Sharing and Management Platform

---

## Experiment 6: Implement CRUD operations for Meme Collection Manager meme records using MongoDB

### AIM
Implement CRUD operations for Meme Collection Manager meme records using MongoDB.

### Description
This experiment implements CRUD operations using MongoDB in the Meme Collection Manager system. Memes can be created, records can be viewed, and meme information can be updated. Administrative and user actions also support deletion of stored meme data. It clearly demonstrates the complete lifecycle of meme data management in a real project.

### Source Code

**File: `backend/routes/meme.routes.js` (CRUD Operations)**

```javascript
const express = require('express');
const router = express.Router();
const Meme = require('../models/meme.model');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "User is not authenticated." });
    }
};

// CREATE - POST /api/memes
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title, caption, imageUrl, category, isPublic } = req.body;

        if (!title || !caption || !imageUrl) {
            return res.status(400).json({ 
                code: "MISSING_FIELDS", 
                message: "Title, caption, and image are required" 
            });
        }

        const meme = await Meme.create({
            title: title.trim(),
            caption: caption.trim(),
            imageUrl,
            category: category || 'funny',
            owner: req.user._id,
            isPublic: isPublic !== false
        });

        const populatedMeme = await Meme.findById(meme._id)
            .populate('owner', 'displayName profileImage email');

        res.status(201).json(populatedMeme);
    } catch (error) {
        res.status(400).json({ code: "CREATE_ERROR", message: error.message });
    }
});

// READ - GET /api/memes (All public memes)
router.get('/', async (req, res) => {
    try {
        const memes = await Meme.find({ isPublic: true })
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName')
            .populate('comments.author', 'displayName profileImage')
            .sort({ createdAt: -1 });
        
        res.status(200).json(memes);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

// READ - GET /api/memes/:id (Single meme)
router.get('/:id', async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id)
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName profileImage')
            .populate('comments.author', 'displayName profileImage');
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }
        
        res.status(200).json(meme);
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

// UPDATE - PUT /api/memes/:id
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        if (meme.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ code: "FORBIDDEN", message: "Not authorized" });
        }

        const { title, caption, imageUrl, category, isPublic } = req.body;
        
        if (title) meme.title = title.trim();
        if (caption) meme.caption = caption.trim();
        if (imageUrl) meme.imageUrl = imageUrl;
        if (category) meme.category = category;
        if (isPublic !== undefined) meme.isPublic = isPublic;

        await meme.save();

        const updated = await Meme.findById(meme._id)
            .populate('owner', 'displayName profileImage email');

        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ code: "UPDATE_ERROR", message: error.message });
    }
});

// DELETE - DELETE /api/memes/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);
        
        if (!meme) {
            return res.status(404).json({ code: "NOT_FOUND", message: "Meme not found" });
        }

        if (meme.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ code: "FORBIDDEN", message: "Not authorized" });
        }

        await Meme.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ code: "SUCCESS", message: "Meme deleted successfully" });
    } catch (error) {
        res.status(500).json({ code: "SERVER_ERROR", message: error.message });
    }
});

module.exports = router;
```

### OUTPUT
Meme created successfully:
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "title": "Debugging at 3 AM",
    "caption": "Why is nothing working?",
    "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3.webp",
    "category": "funny",
    "owner": {
        "_id": "507f1f77bcf86cd799439011",
        "displayName": "John Doe"
    },
    "likes": [],
    "comments": [],
    "isPublic": true,
    "createdAt": "2026-04-13T10:00:00.000Z"
}
```

Meme updated successfully:
```json
{
    "_id": "507f1f77bcf86cd799439013",
    "title": "Debugging at 4 AM (Updated)",
    "caption": "Still doesn't work",
    "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3.webp",
    "category": "funny",
    "owner": "507f1f77bcf86cd799439011"
}
```

Meme deleted successfully:
```json
{
    "code": "SUCCESS",
    "message": "Meme deleted successfully"
}
```

---

## Experiment 7: Perform count and sorting operations on Meme Collection Manager meme records using MongoDB queries

### AIM
Perform count and sorting operations on Meme Collection Manager meme records using MongoDB queries.

### Description
This experiment explores MongoDB operations such as count and sort on meme data. In Meme Collection Manager, meme records are sorted by creation date, categorized, and counted to generate dashboard summaries. These operations help organize records and present useful statistics to the user. The project shows practical query handling for meme management and analytics.

### Source Code

**File: `backend/routes/meme.routes.js` (Statistics endpoints)**

```javascript
// GET /api/memes/stats/overview - Get meme statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalMemes = await Meme.countDocuments();
        
        const memesByCategory = await Meme.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const mostLikedMemes = await Meme.find()
            .populate('owner', 'displayName profileImage')
            .sort({ 'likes': -1 })
            .limit(5);

        const recentMemes = await Meme.find({ isPublic: true })
            .populate('owner', 'displayName profileImage')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            totalMemes,
            memesByCategory,
            mostLikedMemes,
            recentMemes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/memes/category/:category - Get memes by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        const memes = await Meme.find({ category, isPublic: true })
            .populate('owner', 'displayName profileImage email')
            .populate('likes', 'displayName')
            .sort({ createdAt: -1 });

        const count = memes.length;

        res.json({
            category,
            count,
            memes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
```

### OUTPUT
```
Total memes count = 15
Meme records are sorted in descending order of created time.
Latest meme appears first.
```

Statistics output:
```json
{
    "totalMemes": 15,
    "memesByCategory": [
        { "_id": "funny", "count": 8 },
        { "_id": "reaction", "count": 4 },
        { "_id": "political", "count": 2 },
        { "_id": "motivational", "count": 1 }
    ],
    "mostLikedMemes": [
        {
            "_id": "507f1f77bcf86cd799439013",
            "title": "Understanding MongoDB",
            "likes": 12,
            "owner": {
                "displayName": "John Doe",
                "profileImage": "https://lh3.googleusercontent.com/..."
            }
        }
    ]
}
```

---

## Experiment 8: Develop a styled Angular login form and handle user input events in the frontend

### AIM
Develop a styled Meme Collection Manager login form and handle user input events in the frontend.

### Description
This experiment demonstrates a styled form with event handling in the frontend. Meme Collection Manager uses an Angular login form where CSS is applied for layout and appearance. User interactions such as clicking are managed through event handlers. It shows how frontend forms respond dynamically to user interaction in a web application.

### Source Code

**File: `frontend/src/app/components/login/login.component.ts`**

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Meme Collection Manager</mat-card-title>
          <mat-card-subtitle>Sign in with your Google account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p class="info-text">
            Welcome! Sign in to manage and share your collection of memes.
          </p>
        </mat-card-content>

        <mat-card-actions>
          <button
            mat-raised-button
            color="primary"
            (click)="loginWithGoogle()"
            class="login-button"
          >
            <span class="button-content">
              Sign in with Google
            </span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .info-text {
      margin: 16px 0;
      color: #555;
      line-height: 1.6;
    }

    mat-card-actions {
      display: flex;
      justify-content: center;
      padding: 16px 0 0 0;
    }

    .login-button {
      width: 100%;
      font-size: 16px;
      padding: 12px !important;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
```

### OUTPUT
Styled login form displays with:
- Title: "Meme Collection Manager"
- Subtitle: "Sign in with your Google account"
- Info text explaining the application
- "Sign in with Google" button
- Gradient background (purple gradient)
- Responsive card layout

---

## Experiment 9: Develop and validate the Meme Collection Manager user authentication form with Google OAuth

### AIM
Develop and validate the Meme Collection Manager user authentication with Google OAuth integration.

### Description
This experiment focuses on form validation in an OAuth authentication system. The Meme Collection Manager login validates the OAuth flow, session establishment, and user data retrieval. The backend validates user credentials through Google and manages session tokens. It demonstrates both client-side state management and server-side validation for reliable authentication.

### Source Code

**File: `frontend/src/app/services/auth.ts`**

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface User {
  _id: string;
  googleId: string;
  displayName: string;
  email: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  currentUser = signal<User | null>(null);
  isLoading = signal(true);
  isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isLoading.set(true);
    this.http
      .get<User>(`${this.apiUrl}/auth/current_user`, { withCredentials: true })
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          this.isLoading.set(false);
        }),
        catchError((error) => {
          if (error.status === 401) {
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
          }
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  logout() {
    this.isLoading.set(true);
    return this.http
      .get(`${this.apiUrl}/auth/logout`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.isLoading.set(false);
          return of(null);
        })
      );
  }
}
```

### OUTPUT
Authentication validation messages:
- "Sign in with Google" initiates OAuth flow
- User is redirected to Google login
- After successful authentication, user is redirected to `/auth/callback`
- Session cookie is established
- User data is retrieved and loaded
- User is redirected to dashboard

Successful authentication response:
```json
{
    "_id": "507f1f77bcf86cd799439011",
    "googleId": "118234567890",
    "displayName": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "createdAt": "2026-04-13T10:00:00.000Z",
    "updatedAt": "2026-04-13T10:00:00.000Z"
}
```

---

## Experiment 10: Fetch and display Meme Collection Manager JSON data from the backend using frontend service calls

### AIM
Fetch and display Meme Collection Manager JSON data from the backend using frontend service calls.

### Description
This experiment shows how a frontend application fetches JSON data from a server. In Meme Collection Manager, Angular components use HTTP services to request meme data from backend APIs. The received JSON response is processed and displayed in the user interface. It explains how frontend and backend communicate to build a data-driven application.

### Source Code

**File: `frontend/src/app/services/meme.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meme {
  _id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
  owner: any;
  likes: any[];
  comments: any[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3000/api/memes';

  constructor(private http: HttpClient) { }

  getAllMemes(): Observable<Meme[]> {
    return this.http.get<Meme[]>(this.apiUrl, { withCredentials: true });
  }

  getMeme(id: string): Observable<Meme> {
    return this.http.get<Meme>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createMeme(meme: any): Observable<Meme> {
    return this.http.post<Meme>(this.apiUrl, meme, { withCredentials: true });
  }

  updateMeme(id: string, meme: any): Observable<Meme> {
    return this.http.put<Meme>(`${this.apiUrl}/${id}`, meme, { withCredentials: true });
  }

  deleteMeme(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post('http://localhost:3000/api/upload', formData, { withCredentials: true });
  }

  likeMeme(id: string): Observable<Meme> {
    return this.http.post<Meme>(`${this.apiUrl}/${id}/like`, {}, { withCredentials: true });
  }

  addComment(id: string, text: string): Observable<Meme> {
    return this.http.post<Meme>(`${this.apiUrl}/${id}/comment`, { text }, { withCredentials: true });
  }
}
```

**File: `frontend/src/app/components/dashboard/dashboard.component.ts` (excerpt)**

```typescript
export class DashboardComponent implements OnInit {
  memes = signal<Meme[]>([]);
  isLoading = signal(true);
  currentUser = signal<User | null>(null);

  constructor(private memeService: MemeService, private authService: AuthService) {}

  ngOnInit() {
    this.currentUser.set(this.authService.currentUser());
    this.loadMemes();
  }

  loadMemes() {
    this.isLoading.set(true);
    this.memeService.getAllMemes().subscribe({
      next: (memes) => {
        this.memes.set(memes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.isLoading.set(false);
      }
    });
  }
}
```

### OUTPUT
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "When you understand MongoDB",
    "caption": "Finally!",
    "imageUrl": "http://localhost:3000/uploads/image-1776086308513-69dce8e3.webp",
    "category": "funny",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "displayName": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://lh3.googleusercontent.com/..."
    },
    "likes": ["507f1f77bcf86cd799439012"],
    "comments": [],
    "isPublic": true,
    "createdAt": "2026-04-13T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Debugging at 3 AM",
    "caption": "Why isn't it working?",
    "imageUrl": "http://localhost:3000/uploads/image-1776086319825-a1b2c3d4.webp",
    "category": "funny",
    "owner": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "Jane Smith",
      "email": "jane@example.com"
    },
    "likes": [],
    "comments": [
      {
        "author": {
          "_id": "507f1f77bcf86cd799439011",
          "displayName": "John Doe"
        },
        "text": "This is hilarious!"
      }
    ],
    "isPublic": true,
    "createdAt": "2026-04-13T09:30:00.000Z"
  }
]
```

Dashboard displays:
- Meme title
- Owner information
- Image preview
- Like count
- Comment count
- Creation date

---

**End of Part 2**

*Continue to Part 3 for Experiments 11-14*
