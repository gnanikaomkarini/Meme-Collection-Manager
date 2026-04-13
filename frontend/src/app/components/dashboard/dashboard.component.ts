import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { MemeService, Meme } from '../../services/meme';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatGridListModule,
  ],
  template: `
    <div class="dashboard">
      <!-- Header/Navbar -->
      <mat-toolbar color="primary">
        <span class="title">Meme Collection Manager</span>
        <span class="spacer"></span>
        <button mat-button *ngIf="currentUser()" [matMenuTriggerFor]="menu">
          <img
            [src]="currentUser()?.profileImage"
            alt="Profile"
            class="profile-image"
          />
          {{ currentUser()?.displayName }}
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/my-memes">My Memes</button>
          <button mat-menu-item routerLink="/create">Create Meme</button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">Logout</button>
        </mat-menu>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="container">
        <div class="header-section">
          <h1>Meme Collection</h1>
          <button
            mat-raised-button
            color="accent"
            routerLink="/create"
            *ngIf="currentUser()"
          >
            <mat-icon>add</mat-icon>
            Create New Meme
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading memes...</p>
        </div>

        <!-- Memes Grid -->
        <div *ngIf="!isLoading() && memes().length > 0" class="memes-grid">
          <mat-card
            *ngFor="let meme of memes()"
            class="meme-card"
            [routerLink]="['/meme', meme._id]"
          >
            <img mat-card-image [src]="meme.imageUrl" [alt]="meme.title" />
            <mat-card-header>
              <mat-card-title>{{ meme.title }}</mat-card-title>
              <mat-card-subtitle>{{ meme.owner.displayName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="caption">{{ meme.caption }}</p>
              <div class="stats">
                <span class="likes">
                  <mat-icon>favorite</mat-icon>
                  {{ meme.likes.length }}
                </span>
                <span class="comments">
                  <mat-icon>comment</mat-icon>
                  {{ meme.comments.length }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && memes().length === 0" class="empty-state">
          <mat-icon class="empty-icon">image_not_supported</mat-icon>
          <h2>No Memes Yet</h2>
          <p>Be the first to share a meme!</p>
          <button mat-raised-button color="primary" routerLink="/create">
            Create First Meme
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .title {
      font-size: 20px;
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .profile-image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }

    .container {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
      width: 100%;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
    }

    .memes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .meme-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }

    .meme-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    img[mat-card-image] {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    mat-card-header {
      padding: 16px;
    }

    mat-card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    mat-card-subtitle {
      font-size: 12px;
      color: #999;
    }

    mat-card-content {
      padding: 0 16px 16px;
    }

    .caption {
      margin: 0 0 12px;
      color: #666;
      font-size: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #999;
    }

    .stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stats mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 24px;
      color: #999;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser = this.authService.currentUser;
  isLoading = signal(true);
  memes = signal<Meme[]>([]);

  constructor(
    private authService: AuthService,
    private memeService: MemeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMemes();
  }

  loadMemes() {
    this.isLoading.set(true);
    this.memeService.getPublicMemes(1, 20).subscribe({
      next: (response) => {
        this.memes.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.isLoading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }
}
