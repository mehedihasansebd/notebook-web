import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, RegisterInput, User } from './models';

interface Session {
  token: string;
  user: User;
}

const STORAGE_KEY = 'notebook-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // the single source of truth for "who is logged in"
  private readonly session = signal<Session | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.session()?.user.role === 'admin');

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  login(body: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(tap((res) => this.store({ token: res.token, user: res.user })));
  }

  register(body: RegisterInput): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, body)
      .pipe(tap((res) => this.store({ token: res.token, user: res.user })));
  }

  // used after the profile is edited so the navbar shows the new name
  setUser(user: User) {
    const current = this.session();
    if (current) this.store({ ...current, user });
  }

  logout() {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private store(session: Session) {
    this.session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}