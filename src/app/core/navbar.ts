import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { ui } from './ui';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <header class="border-b border-gray-200 bg-white">
      <nav class="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-3">
        <a routerLink="/posts" class="mr-2 text-lg font-semibold">Notebook</a>
        <a routerLink="/posts" [class]="ui.link">Posts</a>

        @if (auth.isLoggedIn()) {
          <a routerLink="/notes" [class]="ui.link">My notes</a>
          <a routerLink="/profile" [class]="ui.link">Profile</a>
        }

        @if (auth.isAdmin()) {
          <a routerLink="/admin/users" [class]="ui.link">Users</a>
          <a routerLink="/admin/notes" [class]="ui.link">All notes</a>
          <a routerLink="/admin/interests" [class]="ui.link">Interests</a>
        }

        <div class="ml-auto flex items-center gap-3">
          @if (auth.user(); as user) {
            <span class="text-sm text-gray-500">{{ user.name }} ({{ user.role }})</span>
            <button [class]="ui.btnLight" (click)="auth.logout()">Log out</button>
          } @else {
            <a routerLink="/login" [class]="ui.link">Log in</a>
            <a routerLink="/register" [class]="ui.link">Register</a>
          }
        </div>
      </nav>
    </header>
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly ui = ui;
}
