import { Component, input, output } from '@angular/core';
import { Meta } from '../core/models';
import { ui } from '../core/ui';

@Component({
  selector: 'app-pagination',
  template: `
    @if (meta(); as m) {
      @if (m.totalPages > 1) {
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-gray-600">
            Page {{ m.page }} of {{ m.totalPages }} · {{ m.total }} total
          </span>
          <div class="flex gap-2">
            <button
              [class]="ui.btnLight"
              [disabled]="m.page <= 1"
              (click)="pageChange.emit(m.page - 1)"
            >
              Previous
            </button>
            <button
              [class]="ui.btnLight"
              [disabled]="m.page >= m.totalPages"
              (click)="pageChange.emit(m.page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      }
    }
  `,
})
export class Pagination {
  readonly meta = input<Meta | null | undefined>();
  readonly pageChange = output<number>();
  protected readonly ui = ui;
}
