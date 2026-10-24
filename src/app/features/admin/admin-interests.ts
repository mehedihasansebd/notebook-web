import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { InterestGroup, Paged } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-admin-interests',
  imports: [FormsModule, Pagination],
  template: `
    <div class="space-y-4">
      <h1 class="text-lg font-semibold">Users grouped by interest</h1>

      <form class="flex gap-2" (ngSubmit)="applyFilter()">
        <input
          [class]="ui.input"
          name="filter"
          placeholder="Filter by one interest, e.g. chess"
          [(ngModel)]="draft"
        />
        <button [class]="ui.btn">Filter</button>
        @if (interest()) {
          <button type="button" [class]="ui.btnLight" (click)="clearFilter()">Clear</button>
        }
      </form>

      @if (error()) {
        <p [class]="ui.error">{{ error() }}</p>
      }

      @if (result(); as res) {
        @if (res.data.length === 0) {
          <p class="text-sm text-gray-500">No matches.</p>
        }

        <ul class="space-y-3" [class.opacity-60]="loading()">
          @for (group of res.data; track group.interest) {
            <li [class]="ui.card">
              <div class="flex items-baseline justify-between">
                <h3 class="font-medium capitalize">{{ group.interest }}</h3>
                <span class="text-sm text-gray-500">{{ group.count }} users</span>
              </div>
              <p class="mt-1 text-sm text-gray-700">{{ names(group) }}</p>
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
export class AdminInterests implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly ui = ui;
  protected readonly page = signal(1);
  protected readonly interest = signal('');
  protected readonly result = signal<Paged<InterestGroup> | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected draft = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getUsersByInterest(this.page(), this.interest() || undefined).subscribe({
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

  applyFilter() {
    this.page.set(1);
    this.interest.set(this.draft.trim().toLowerCase());
    this.load();
  }

  clearFilter() {
    this.draft = '';
    this.interest.set('');
    this.page.set(1);
    this.load();
  }

  names(group: InterestGroup) {
    return group.users.map((user) => user.name).join(', ');
  }
}