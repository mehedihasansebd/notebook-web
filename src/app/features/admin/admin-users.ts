import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Paged, Role, User } from '../../core/models';
import { ui } from '../../core/ui';
import { errorMessage, splitList } from '../../core/utils';
import { Pagination } from '../../shared/pagination';

@Component({
  selector: 'app-admin-users',
  imports: [ReactiveFormsModule, Pagination],
  template: `
    <div class="space-y-6">
      <form [formGroup]="form" (ngSubmit)="submit()" [class]="ui.card + ' grid gap-3 sm:grid-cols-2'">
        <h1 class="text-lg font-semibold sm:col-span-2">
          {{ editingId() ? 'Edit user' : 'Add user' }}
        </h1>

        <div>
          <label [class]="ui.label">Name</label>
          <input [class]="ui.input" formControlName="name" />
        </div>
        <div>
          <label [class]="ui.label">Email</label>
          <input [class]="ui.input" type="email" formControlName="email" />
        </div>
        <div>
          <label [class]="ui.label">
            Password{{ editingId() ? ' (leave empty to keep the current one)' : '' }}
          </label>
          <input [class]="ui.input" type="password" formControlName="password" />
        </div>
        <div>
          <label [class]="ui.label">Role</label>
          <select [class]="ui.input" formControlName="role">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label [class]="ui.label">Interests (comma separated)</label>
          <input [class]="ui.input" formControlName="interests" />
        </div>

        @if (formError()) {
          <p [class]="ui.error + ' sm:col-span-2'">{{ formError() }}</p>
        }

        <div class="flex gap-2 sm:col-span-2">
          <button [class]="ui.btn" [disabled]="saving()">
            {{ editingId() ? 'Save changes' : 'Create user' }}
          </button>
          @if (editingId()) {
            <button type="button" [class]="ui.btnLight" (click)="resetForm()">Cancel</button>
          }
        </div>
      </form>

      <section>
        <h2 class="mb-3 text-lg font-semibold">All users</h2>

        @if (error()) {
          <p [class]="ui.error">{{ error() }}</p>
        }

        @if (result(); as res) {
          <div [class]="ui.card + ' overflow-x-auto p-0'" [class.opacity-60]="loading()">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-200 text-gray-500">
                <tr>
                  <th class="px-4 py-2">Name</th>
                  <th class="px-4 py-2">Email</th>
                  <th class="px-4 py-2">Role</th>
                  <th class="px-4 py-2">Interests</th>
                  <th class="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                @for (user of res.data; track user._id) {
                  <tr class="border-b border-gray-100 last:border-0">
                    <td class="px-4 py-2">{{ user.name }}</td>
                    <td class="px-4 py-2">{{ user.email }}</td>
                    <td class="px-4 py-2">{{ user.role }}</td>
                    <td class="px-4 py-2">{{ user.interests.join(', ') }}</td>
                    <td class="flex justify-end gap-2 px-4 py-2">
                      <button [class]="ui.btnLight" (click)="startEdit(user)">Edit</button>
                      <button [class]="ui.btnDanger" (click)="remove(user)">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <app-pagination [meta]="res.meta" (pageChange)="goTo($event)" />
        } @else if (loading()) {
          <p class="text-sm text-gray-500">Loading...</p>
        }
      </section>
    </div>
  `,
})
export class AdminUsers implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly ui = ui;
  protected readonly page = signal(1);
  protected readonly result = signal<Paged<User> | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['user' as Role],
    interests: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAdminUsers(this.page()).subscribe({
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

  startEdit(user: User) {
    this.editingId.set(user._id);
    this.form.setValue({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      interests: user.interests.join(', '),
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset({ role: 'user' });
    this.formError.set('');
  }

  submit() {
    const id = this.editingId();
    const { password, interests, ...rest } = this.form.getRawValue();

    if (this.form.invalid || (!id && password.length < 8)) {
      this.form.markAllAsTouched();
      this.formError.set(
        id ? 'Check name and email' : 'Name, email and a password of 8+ characters are required',
      );
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const body = { ...rest, interests: splitList(interests) };
    const request = id
      ? this.api.updateAdminUser(id, password ? { ...body, password } : body)
      : this.api.createAdminUser({ ...body, password });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        if (!id) this.page.set(1);
        this.resetForm();
        this.load();
      },
      error: (err) => {
        this.formError.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }

  remove(user: User) {
    if (!window.confirm(`Delete ${user.name} and everything they wrote?`)) return;

    this.api.deleteAdminUser(user._id).subscribe({
      next: () => {
        const itemsOnPage = this.result()?.data.length ?? 0;
        if (itemsOnPage === 1 && this.page() > 1) this.page.update((p) => p - 1);
        this.load();
      },
      error: (err) => window.alert(errorMessage(err)),
    });
  }
}