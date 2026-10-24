import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ui } from '../../core/ui';
import { errorMessage, splitList } from '../../core/utils';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" [class]="ui.card + ' max-w-md space-y-3'">
      <h1 class="text-lg font-semibold">My profile</h1>
      <p class="text-sm text-gray-600">{{ auth.user()?.email }} · {{ auth.user()?.role }}</p>

      <div>
        <label [class]="ui.label">Name</label>
        <input [class]="ui.input" formControlName="name" />
      </div>
      <div>
        <label [class]="ui.label">Interests (comma separated)</label>
        <input [class]="ui.input" formControlName="interests" />
      </div>

      @if (message()) {
        <p class="text-sm text-green-700">{{ message() }}</p>
      }
      @if (error()) {
        <p [class]="ui.error">{{ error() }}</p>
      }

      <button [class]="ui.btn" [disabled]="saving()">Save</button>
    </form>
  `,
})
export class ProfilePage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  protected readonly ui = ui;
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: [this.auth.user()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    interests: [this.auth.user()?.interests.join(', ') ?? ''],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Name must be at least 2 characters');
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    const { name, interests } = this.form.getRawValue();

    this.api.updateProfile({ name, interests: splitList(interests) }).subscribe({
      next: (res) => {
        this.auth.setUser(res.user);
        this.message.set('Profile updated');
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
