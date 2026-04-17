import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/theme.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, UiIconComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  protected readonly theme = inject(ThemeService);

  email = '';
  password = '';

  constructor() {
    this.theme.initFromStorage();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  submit(ev: Event): void {
    ev.preventDefault();
  }
}
