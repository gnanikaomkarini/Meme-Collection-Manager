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

  /**
   * Check current authentication status
   */
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
          // 401 means not authenticated
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

  /**
   * Redirect to Google login
   */
  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  /**
   * Logout the user
   */
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
