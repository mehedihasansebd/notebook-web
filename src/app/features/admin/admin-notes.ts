import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Note, Paged } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-admin-notes',
  imports: [DatePipe, Pagination],
  template: `
    <div>
      <h1 class="mb-3 text-lg font-semibold">Everyone's notes</h1>

      @if (error()) {
        <p [class]="ui.error">{{ error() }}</p>
      }

      @if (result(); as res) {
        <ul class="space-y-3" [class.opacity-60]="loading()">
          @for (note of res.data; track note._id) {
            <li [class]="ui.card">
              <h3 class="font-medium">{{ note.title }}</h3>
              <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700">{{ note.content }}</p>
              <p class="mt-2 text-xs text-gray-500">
                {{ ownerLabel(note) }} · {{ note.createdAt | date: 'medium' }}
              </p>
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
export class AdminNotes implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly ui = ui;
  protected readonly page = signal(1);
  protected readonly result = signal<Paged<Note> | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAdminNotes(this.page()).subscribe({
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

  ownerLabel(note: Note) {
    return typeof note.owner === 'object' ? `${note.owner.name} (${note.owner.email})` : '';
  }
}
