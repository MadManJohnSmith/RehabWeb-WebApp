import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article
      class="rounded-card border border-pm-border bg-pm-surface p-6 shadow-pm-sm dark:border-pm-border-dark dark:bg-pm-surface-dark dark:shadow-pm-sm-dark"
    >
      <p class="text-sm font-normal text-pm-muted dark:text-pm-muted-dark">{{ label() }}</p>
      <p class="mt-2 text-2xl font-bold tracking-tight text-pm-ink dark:text-pm-ink-on-dark">
        {{ value() }}
      </p>
      @if (hint()) {
        <p class="mt-1 text-xs font-normal text-pm-muted dark:text-pm-muted-dark">{{ hint() }}</p>
      }
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
}
