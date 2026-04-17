import { afterNextRender, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
})
export class LandingComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    afterNextRender(() => this.theme.initFromStorage());
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
