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
    
    p {
      font-size: 18px;
      color: #666;
    }
  `]
})
export class App {
  protected readonly title = signal('meme-app');
  authService = inject(AuthService);
}
