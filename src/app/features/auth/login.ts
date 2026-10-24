import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ui } from '../../core/ui';
import { errorMessage } from '../../core/utils';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div [class]="ui.card + ' mx-auto max-w-sm'">
      <h1 class="mb-4 text-xl font-semibold">Log in</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
        <div>
          <label [class]="ui.label">Email</label>
          <input [class]="ui.input" type="email" formControlName="email" />
        </div>
        <div>
          <label [class]="ui.label">Password</label>
          <input [class]="ui.input" type="password" formControlName="password" />
        </div>

        @if (error()) {
          <p [class]="ui.error">{{ error() }}</p>
        }

        <button [class]="ui.btn + ' w-full'" [disabled]="loading()">
          {{ loading() ? 'Signing in...' : 'Log in' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-gray-600">
        No account yet?
        <a routerLink="/register" class="underline">Register</a>
      </p>
    </div>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly ui = ui;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Enter a valid email and your password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/notes']),
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}