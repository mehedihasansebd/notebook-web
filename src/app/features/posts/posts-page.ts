import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Paged, Post } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-posts-page',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Pagination],
  template: `
    <div class="space-y-6">
      @if (auth.isLoggedIn()) {
        <form [formGroup]="form" (ngSubmit)="submit()" [class]="ui.card + ' space-y-3'">
          <h1 class="text-lg font-semibold">Write a post</h1>
          <div>
            <label [class]="ui.label">Title</label>
            <input [class]="ui.input" formControlName="title" />
          </div>
          <div>
            <label [class]="ui.label">Body</label>
            <textarea [class]="ui.input" rows="4" formControlName="body"></textarea>
          </div>

          @if (formError()) {
            <p [class]="ui.error">{{ formError() }}</p>
          }

          <button [class]="ui.btn" [disabled]="saving()">Publish</button>
        </form>
      } @else {
        <p class="text-sm text-gray-600">
          <a routerLink="/login" class="underline">Log in</a> to publish your own posts.
        </p>
      }

      <section>
        <h2 class="mb-3 text-lg font-semibold">Latest posts</h2>

        @if (error()) {
          <p [class]="ui.error">{{ error() }}</p>
        }

        @if (result(); as res) {
          @if (res.data.length === 0) {
            <p class="text-sm text-gray-500">Nothing published yet.</p>
          }

          <ul class="space-y-3" [class.opacity-60]="loading()">
            @for (post of res.data; track post._id) {
              <li [class]="ui.card">
                <h3 class="font-medium">{{ post.title }}</h3>
                <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700">{{ post.body }}</p>
                <p class="mt-2 text-xs text-gray-500">
                  by
                  <a [routerLink]="['/users', post.author._id]" class="underline">{{
                    post.author.name
                  }}</a>
                  · {{ post.createdAt | date: 'medium' }}
                </p>
              </li>
            }
          </ul>

          <app-pagination [meta]="res.meta" (pageChange)="goTo($event)" />
        } @else if (loading()) {
          <p class="text-sm text-gray-500">Loading...</p>
        }
      </section>
    </div>
  `,
})
export class PostsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  protected readonly ui = ui;
  protected readonly page = signal(1);
  protected readonly result = signal<Paged<Post> | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    body: ['', Validators.required],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getPosts(this.page()).subscribe({
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

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Title and body are required');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    this.api.createPost(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.page.set(1);
        this.load();
      },
      error: (err) => {
        this.formError.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
