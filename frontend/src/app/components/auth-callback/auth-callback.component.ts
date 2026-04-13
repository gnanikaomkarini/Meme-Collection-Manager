import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div style="display: flex; align-items: center; justify-content: center; height: 100vh;">
    <p>Completing login...</p>
  </div>`,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Wait a moment for the cookie to be set, then check auth status
    setTimeout(() => {
      this.authService.checkAuthStatus();
      
      // Wait for auth check to complete
      const checkInterval = setInterval(() => {
        if (!this.authService.isLoading()) {
          clearInterval(checkInterval);
          if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/login']);
          }
        }
      }, 100);
    }, 500);
  }
}
