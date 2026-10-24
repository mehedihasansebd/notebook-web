import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './core/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar />
    <main class="mx-auto max-w-4xl px-4 py-8">
      <router-outlet />
    </main>
  `,
})
export class App {}