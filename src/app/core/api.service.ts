import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  AdminUserInput,
  InterestGroup,
  Note,
  NoteInput,
  Paged,
  Post,
  PostInput,
  User,
  UserPostsResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private paging(page: number, limit: number, extra: Record<string, string | undefined> = {}) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    for (const [key, value] of Object.entries(extra)) {
      if (value) params = params.set(key, value);
    }
    return params;
  }

  // notes
  getNotes(page: number, limit = 5) {
    return this.http.get<Paged<Note>>(`${this.base}/notes`, { params: this.paging(page, limit) });
  }
  createNote(body: NoteInput) {
    return this.http.post<{ note: Note }>(`${this.base}/notes`, body);
  }
  updateNote(id: string, body: NoteInput) {
    return this.http.patch<{ note: Note }>(`${this.base}/notes/${id}`, body);
  }
  deleteNote(id: string) {
    return this.http.delete<void>(`${this.base}/notes/${id}`);
  }

  // posts
  getPosts(page: number, limit = 5) {
    return this.http.get<Paged<Post>>(`${this.base}/posts`, { params: this.paging(page, limit) });
  }
  createPost(body: PostInput) {
    return this.http.post<{ post: Post }>(`${this.base}/posts`, body);
  }
  getUserPosts(id: string, page: number, limit = 5) {
    return this.http.get<UserPostsResponse>(`${this.base}/users/${id}/posts`, {
      params: this.paging(page, limit),
    });
  }

  // profile
  updateProfile(body: { name?: string; interests?: string[] }) {
    return this.http.patch<{ user: User }>(`${this.base}/users/me`, body);
  }

  // admin
  getAdminUsers(page: number, limit = 6) {
    return this.http.get<Paged<User>>(`${this.base}/admin/users`, {
      params: this.paging(page, limit),
    });
  }
  createAdminUser(body: AdminUserInput) {
    return this.http.post<{ user: User }>(`${this.base}/admin/users`, body);
  }
  updateAdminUser(id: string, body: Partial<AdminUserInput>) {
    return this.http.patch<{ user: User }>(`${this.base}/admin/users/${id}`, body);
  }
  deleteAdminUser(id: string) {
    return this.http.delete<void>(`${this.base}/admin/users/${id}`);
  }
  getAdminNotes(page: number, limit = 6) {
    return this.http.get<Paged<Note>>(`${this.base}/admin/notes`, {
      params: this.paging(page, limit),
    });
  }
  getUsersByInterest(page: number, interest?: string, limit = 5) {
    return this.http.get<Paged<InterestGroup>>(`${this.base}/admin/users/by-interests`, {
      params: this.paging(page, limit, { interest }),
    });
  }
}