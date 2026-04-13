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
