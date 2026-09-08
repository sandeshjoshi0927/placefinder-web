import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, User } from '../models/user.model';

interface StoredSession {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = 'placefinder_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Read once at construction time so both signals start from the same value.
  private readonly initialSession = this.restoreSession();

  private readonly _currentUser = signal<AuthUser | null>(this.initialSession?.user ?? null);
  private readonly _token = signal<string | null>(this.initialSession?.token ?? null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  get token(): string | null {
    return this._token();
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .get<User[]>(`${environment.apiUrl}/users`, { params: { email, password } })
      .pipe(
        map((users) => {
          if (users.length !== 1) {
            throw new Error('Invalid email or password');
          }
          const { password: _pw, ...authUser } = users[0];
          return authUser;
        }),
        tap((authUser) => this.setSession(authUser)),
        catchError((err) => throwError(() => err)),
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigateByUrl('/login');
  }

  // private helpers
  private setSession(user: AuthUser): void {
    const token = btoa(`${user.id}:${Date.now()}`);
    this._currentUser.set(user);
    this._token.set(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user } satisfies StoredSession));
  }

  private restoreSession(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }
}
