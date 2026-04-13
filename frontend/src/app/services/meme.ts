import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Meme {
  _id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: 'funny' | 'political' | 'reaction' | 'motivational' | 'other';
  owner: any;
  likes: any[];
  comments: any[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemeListResponse {
  data: Meme[];
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MemeService {
  private apiUrl = 'http://localhost:3000/api/memes';

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of public memes
   */
  getPublicMemes(page: number = 1, limit: number = 10) {
    return this.http.get<MemeListResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`, {
      withCredentials: true
    });
  }

  /**
   * Get user's own memes
   */
  getMyMemes(page: number = 1, limit: number = 10) {
    return this.http.get<MemeListResponse>(`${this.apiUrl}/my-memes?page=${page}&limit=${limit}`, {
      withCredentials: true
    });
  }

  /**
   * Get a single meme by ID
   */
  getMeme(id: string) {
    return this.http.get<Meme>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Create a new meme
   */
  createMeme(data: {
    title: string;
    caption: string;
    imageUrl: string;
    category?: string;
    isPublic?: boolean;
  }) {
    return this.http.post<Meme>(`${this.apiUrl}`, data, {
      withCredentials: true
    });
  }

  /**
   * Update a meme (partial update)
   */
  updateMeme(id: string, data: any) {
    return this.http.patch<Meme>(`${this.apiUrl}/${id}`, data, {
      withCredentials: true
    });
  }

  /**
   * Delete a meme
   */
  deleteMeme(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Like a meme
   */
  likeMeme(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, {
      withCredentials: true
    });
  }

  /**
   * Unlike a meme
   */
  unlikeMeme(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/like`, {
      withCredentials: true
    });
  }

  /**
   * Add a comment to a meme
   */
  addComment(id: string, text: string) {
    return this.http.post(`${this.apiUrl}/${id}/comments`, { text }, {
      withCredentials: true
    });
  }

  /**
   * Delete a comment
   */
  deleteComment(id: string, commentId: string) {
    return this.http.delete(`${this.apiUrl}/${id}/comments/${commentId}`, {
      withCredentials: true
    });
  }
}
