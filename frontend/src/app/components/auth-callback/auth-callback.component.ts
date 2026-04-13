import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 20px;">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Completing login...</p>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // The backend has set the session cookie, now we need to verify it
    // Add a delay to ensure the cookie is set before checking
    setTimeout(() => {
      this.authService.checkAuthStatus();
      
      // Wait for the auth check to complete
      const maxAttempts = 50; // 5 seconds max (50 * 100ms)
      let attempts = 0;
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (!this.authService.isLoading() || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          
          if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/login']);
          }
        }
      }, 100);
    }, 1000); // Wait 1 second for cookie to be set
  }
}

