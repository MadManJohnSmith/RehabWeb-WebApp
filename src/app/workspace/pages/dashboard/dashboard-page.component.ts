import { Component } from '@angular/core';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  readonly romSeries = [
    { label: 'S1', value: 42 },
    { label: 'S2', value: 48 },
    { label: 'S3', value: 55 },
    { label: 'S4', value: 61 },
    { label: 'S5', value: 64 },
    { label: 'S6', value: 68 },
  ];

  barHeightPx(score: number): number {
    return Math.max(24, Math.round((score / 70) * 160));
  }
}
