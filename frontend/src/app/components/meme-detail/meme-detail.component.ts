import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemeService, Meme } from '../../services/meme';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
  ],
  template: `
    <div class="detail-container">
      <!-- Header/Navbar -->
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="title">Meme Detail</span>
        <span class="spacer"></span>
        <button
          mat-icon-button
          [matMenuTriggerFor]="memeMenu"
          *ngIf="currentUser() && isOwner()"
        >
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #memeMenu="matMenu">
          <button
            mat-menu-item
            [routerLink]="['/edit', meme()?._id]"
          >
            <mat-icon>edit</mat-icon>
            <span>Edit</span>
          </button>
          <button mat-menu-item (click)="deleteMeme()">
            <mat-icon>delete</mat-icon>
            <span>Delete</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading meme...</p>
      </div>

      <!-- Meme Content -->
      <div *ngIf="!isLoading() && meme()" class="content">
        <div class="meme-card">
          <img [src]="meme()!.imageUrl" [alt]="meme()!.title" class="meme-image" />

          <!-- Meme Info -->
          <mat-card class="info-card">
            <mat-card-header>
              <div class="header-top">
                <div class="header-text">
                  <mat-card-title>{{ meme()!.title }}</mat-card-title>
                  <mat-card-subtitle>
                    by {{ meme()!.owner.displayName }}
                  </mat-card-subtitle>
                </div>
                <img
                  [src]="meme()!.owner.profileImage"
                  alt="Profile"
                  class="profile-image"
                />
              </div>
            </mat-card-header>

            <mat-card-content>
              <p class="caption">{{ meme()!.caption }}</p>

              <div class="meta-info">
                <span class="category">
                  <mat-icon>label</mat-icon>
                  {{ meme()!.category | titlecase }}
                </span>
                <span class="date">
                  {{ meme()!.createdAt | date : 'short' }}
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons" *ngIf="currentUser()">
                <button
                  mat-raised-button
                  (click)="toggleLike()"
                  [color]="isLiked() ? 'warn' : 'primary'"
                  [disabled]="isLiking()"
                >
                  <mat-icon>{{ isLiked() ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ meme()!.likes.length }} Likes
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <mat-card class="comments-card">
            <mat-card-header>
              <mat-card-title>Comments ({{ meme()!.comments.length }})</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <!-- Comment Form -->
              <form [formGroup]="commentForm" (ngSubmit)="addComment()" *ngIf="currentUser()">
                <div class="comment-input-group">
                  <mat-form-field class="full-width">
                    <mat-label>Add a comment...</mat-label>
                    <input
                      matInput
                      formControlName="text"
                      placeholder="Share your thoughts"
                    />
                  </mat-form-field>
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="!commentForm.valid || isCommentSubmitting()"
                  >
                    Post
                  </button>
                </div>
              </form>

              <!-- Comments List -->
              <div class="comments-list">
                <div *ngIf="meme()!.comments.length === 0" class="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
                </div>

                <div *ngFor="let comment of meme()!.comments" class="comment">
                  <div class="comment-header">
                    <img
                      [src]="comment.author.profileImage"
                      alt="Profile"
                      class="comment-avatar"
                    />
                    <div class="comment-info">
                      <strong>{{ comment.author.displayName }}</strong>
                      <span class="comment-date">
                        {{ comment.createdAt | date : 'short' }}
                      </span>
                    </div>
                    <button
                      mat-icon-button
                      *ngIf="currentUser() && isCommentOwner(comment)"
                      (click)="deleteComment(comment._id)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading() && !meme()" class="error-container">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h2>Meme Not Found</h2>
        <p>This meme doesn't exist or you don't have permission to view it.</p>
        <button mat-raised-button color="primary" routerLink="/">
          Back to Memes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .title {
      margin-left: 16px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      flex: 1;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      flex: 1;
      text-align: center;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .content {
      flex: 1;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 16px;
      width: 100%;
    }

    .meme-card {
      margin-bottom: 32px;
    }

    .meme-image {
      width: 100%;
      max-height: 600px;
      object-fit: contain;
      background: #f0f0f0;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .info-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .header-text {
      flex: 1;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    mat-card-subtitle {
      color: #999;
    }

    .profile-image {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .caption {
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
      color: #333;
    }

    .meta-info {
      display: flex;
      gap: 24px;
      margin: 24px 0;
      padding: 16px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }

    .meta-info span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .comments-section {
      margin-top: 32px;
    }

    .comments-card {
      width: 100%;
    }

    mat-card-content {
      padding: 0;
    }

    .comment-input-group {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .full-width {
      flex: 1;
      width: 100%;
    }

    .comments-list {
      padding: 0 16px 16px;
    }

    .no-comments {
      padding: 32px 16px;
      text-align: center;
      color: #999;
    }

    .comment {
      padding: 16px;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }

    .comment:hover {
      background: #fafafa;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .comment-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .comment-info strong {
      font-weight: 600;
    }

    .comment-date {
      font-size: 12px;
      color: #999;
    }

    .comment-text {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }

    button[mat-icon-button] {
      width: 32px;
      height: 32px;
      margin: 0;
    }
  `]
})
export class MemeDetailComponent implements OnInit {
  meme = signal<Meme | null>(null);
  isLoading = signal(true);
  isLiking = signal(false);
  isCommentSubmitting = signal(false);
  isLiked = signal(false);
  
  commentForm: FormGroup;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memeService: MemeService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadMeme(params['id']);
      }
    });
  }

  private loadMeme(id: string) {
    this.isLoading.set(true);
    this.memeService.getMeme(id).subscribe({
      next: (meme) => {
        this.meme.set(meme);
        this.updateLikedStatus();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading meme:', error);
        this.isLoading.set(false);
      }
    });
  }

  private updateLikedStatus() {
    const meme = this.meme();
    const currentUser = this.currentUser();
    if (meme && currentUser) {
      const liked = meme.likes.some((user: any) => user._id === currentUser._id);
      this.isLiked.set(liked);
    }
  }

  toggleLike() {
    if (!this.meme() || this.isLiking()) return;

    this.isLiking.set(true);

    if (this.isLiked()) {
      this.memeService.unlikeMeme(this.meme()!._id).subscribe({
        next: () => {
          this.loadMeme(this.meme()!._id);
          this.isLiking.set(false);
        },
        error: (error) => {
          console.error('Error unliking meme:', error);
          this.isLiking.set(false);
        }
      });
    } else {
      this.memeService.likeMeme(this.meme()!._id).subscribe({
        next: () => {
          this.loadMeme(this.meme()!._id);
          this.isLiking.set(false);
        },
        error: (error) => {
          console.error('Error liking meme:', error);
          this.isLiking.set(false);
        }
      });
    }
  }

  addComment() {
    if (!this.commentForm.valid || !this.meme()) return;

    this.isCommentSubmitting.set(true);
    const text = this.commentForm.get('text')?.value;

    this.memeService.addComment(this.meme()!._id, text).subscribe({
      next: () => {
        this.commentForm.reset();
        this.loadMeme(this.meme()!._id);
        this.isCommentSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.isCommentSubmitting.set(false);
      }
    });
  }

  deleteComment(commentId: string) {
    if (!this.meme() || !confirm('Are you sure you want to delete this comment?')) return;

    this.memeService.deleteComment(this.meme()!._id, commentId).subscribe({
      next: () => {
        this.loadMeme(this.meme()!._id);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  deleteMeme() {
    if (!this.meme() || !confirm('Are you sure you want to delete this meme?')) return;

    this.memeService.deleteMeme(this.meme()!._id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error deleting meme:', error);
      }
    });
  }

  isOwner(): boolean {
    const meme = this.meme();
    const currentUser = this.currentUser();
    return !!(meme && currentUser && meme.owner._id === currentUser._id);
  }

  isCommentOwner(comment: any): boolean {
    const currentUser = this.currentUser();
    return !!(currentUser && (comment.author._id === currentUser._id || this.isOwner()));
  }
}
