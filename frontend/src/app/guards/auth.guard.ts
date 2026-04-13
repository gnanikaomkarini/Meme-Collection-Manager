import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Create an observable that emits when loading is complete
  // This subscribes to the isLoading signal until it becomes false
  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (!authService.isLoading()) {
        // Auth status check is complete
        if (authService.isAuthenticated()) {
          resolve(true);
        } else {
          router.navigate(['/login']);
          resolve(false);
        }
      } else {
        // Still loading, check again in 50ms
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Create a promise that resolves when loading is complete
  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (!authService.isLoading()) {
        // Auth status check is complete
        if (!authService.isAuthenticated()) {
          resolve(true);
        } else {
          // Already logged in, redirect to dashboard
          router.navigate(['/']);
          resolve(false);
        }
      } else {
        // Still loading, check again in 50ms
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};
