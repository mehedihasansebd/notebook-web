import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { UserPostsResponse } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-user-posts-page',
  imports: [RouterLink, DatePipe, Pagination],
  template: `
    <div class="space-y-4">
      <a routerLink="/posts" class="text-sm underline">Back to posts</a>

      @if (error()) {
        <p [class]="ui.error">{{ error() }}</p>
      }

      @if (result(); as res) {
        <div>
          <h1 class="text-xl font-semibold">{{ res.user.name }}</h1>
          @if (res.user.interests.length) {
            <p class="text-sm text-gray-600">Interests: {{ res.user.interests.join(', ') }}</p>
          }
        </div>

        @if (res.user.posts.length === 0) {
          <p class="text-sm text-gray-500">No posts yet.</p>
        }

        <ul class="space-y-3" [class.opacity-60]="loading()">
          @for (post of res.user.posts; track post._id) {
            <li [class]="ui.card">
              <h3 class="font-medium">{{ post.title }}</h3>
              <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700">{{ post.body }}</p>
              <p class="mt-2 text-xs text-gray-400">{{ post.createdAt | date: 'medium' }}</p>
            </li>
          }
        </ul>

        <app-pagination [meta]="res.meta" (pageChange)="goTo($event)" />
      } @else if (loading()) {
        <p class="text-sm text-gray-500">Loading...</p>
      }
    </div>
  `,
})
export class UserPostsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly ui = ui;
  protected readonly page = signal(1);
  protected readonly result = signal<UserPostsResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  private userId = '';

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getUserPosts(this.userId, this.page()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.error.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  goTo(page: number) {
    this.page.set(page);
    this.load();
  }
}
