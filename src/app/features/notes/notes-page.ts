import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Note, Paged } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-notes-page',
  imports: [ReactiveFormsModule, DatePipe, Pagination],
  template: `
    <div class="space-y-6">
      <form [formGroup]="form" (ngSubmit)="submit()" [class]="ui.card + ' space-y-3'">
        <h1 class="text-lg font-semibold">{{ editingId() ? 'Edit note' : 'New note' }}</h1>
        <div>
          <label [class]="ui.label">Title</label>
          <input [class]="ui.input" formControlName="title" />
        </div>
        <div>
          <label [class]="ui.label">Content</label>
          <textarea [class]="ui.input" rows="4" formControlName="content"></textarea>
        </div>

        @if (formError()) {
          <p [class]="ui.error">{{ formError() }}</p>
        }

        <div class="flex gap-2">
          <button [class]="ui.btn" [disabled]="saving()">
            {{ editingId() ? 'Save changes' : 'Add note' }}
          </button>
          @if (editingId()) {
            <button type="button" [class]="ui.btnLight" (click)="resetForm()">Cancel</button>
          }
        </div>
      </form>

      <section>
        <h2 class="mb-3 text-lg font-semibold">My notes</h2>

        @if (error()) {
          <p [class]="ui.error">{{ error() }}</p>
        }

        @if (result(); as res) {
          @if (res.data.length === 0) {
            <p class="text-sm text-gray-500">No notes yet. Write your first one above.</p>
          }

          <ul class="space-y-3" [class.opacity-60]="loading()">
            @for (note of res.data; track note._id) {
              <li [class]="ui.card">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-medium">{{ note.title }}</h3>
                    <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700">{{ note.content }}</p>
                    <p class="mt-2 text-xs text-gray-400">{{ note.createdAt | date: 'medium' }}</p>
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button [class]="ui.btnLight" (click)="startEdit(note)">Edit</button>
                    <button [class]="ui.btnDanger" (click)="remove(note)">Delete</button>
                  </div>
                </div>
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
export class NotesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly ui = ui;

  protected readonly page = signal(1);
  protected readonly result = signal<Paged<Note> | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    content: ['', Validators.required],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getNotes(this.page()).subscribe({
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

  startEdit(note: Note) {
    this.editingId.set(note._id);
    this.form.setValue({ title: note.title, content: note.content });
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset();
    this.formError.set('');
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Title and content are required');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const body = this.form.getRawValue();
    const id = this.editingId();
    const request = id ? this.api.updateNote(id, body) : this.api.createNote(body);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        if (!id) this.page.set(1); // a new note is listed first
        this.load();
      },
      error: (err) => {
        this.formError.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }

  remove(note: Note) {
    if (!window.confirm('Delete this note?')) return;

    this.api.deleteNote(note._id).subscribe({
      next: () => {
        // if that was the last item on this page, step back one page
        const itemsOnPage = this.result()?.data.length ?? 0;
        if (itemsOnPage === 1 && this.page() > 1) this.page.update((p) => p - 1);
        this.load();
      },
      error: (err) => window.alert(errorMessage(err)),
    });
  }
}