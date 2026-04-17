import { Component, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/theme.service';
import { UiIconComponent } from '../ui-icon/ui-icon.component';

@Component({
  selector: 'app-shell-top-bar',
  standalone: true,
  imports: [UiIconComponent],
  templateUrl: './shell-top-bar.component.html',
})
export class ShellTopBarComponent {
  protected readonly theme = inject(ThemeService);

  readonly title = input.required<string>();
  readonly menuToggle = output<void>();

  toggleTheme(): void {
    this.theme.toggle();
  }
}
