import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ui } from '../../core/ui';
import { errorMessage, splitList } from '../../core/utils';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div [class]="ui.card + ' mx-auto max-w-sm'">
      <h1 class="mb-4 text-xl font-semibold">Create an account</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
        <div>
          <label [class]="ui.label">Name</label>
          <input [class]="ui.input" formControlName="name" />
        </div>
        <div>
          <label [class]="ui.label">Email</label>
          <input [class]="ui.input" type="email" formControlName="email" />
        </div>
        <div>
          <label [class]="ui.label">Password (min 8 characters)</label>
          <input [class]="ui.input" type="password" formControlName="password" />
        </div>
        <div>
          <label [class]="ui.label">Interests (comma separated)</label>
          <input [class]="ui.input" placeholder="chess, reading" formControlName="interests" />
        </div>

        @if (error()) {
          <p [class]="ui.error">{{ error() }}</p>
        }

        <button [class]="ui.btn + ' w-full'" [disabled]="loading()">
          {{ loading() ? 'Creating...' : 'Register' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-gray-600">
        Already registered?
        <a routerLink="/login" class="underline">Log in</a>
      </p>
    </div>
  `,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly ui = ui;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    interests: [''],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Check the form: name, a valid email and a password of 8+ characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { interests, ...rest } = this.form.getRawValue();

    this.auth.register({ ...rest, interests: splitList(interests) }).subscribe({
      next: () => this.router.navigate(['/notes']),
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}