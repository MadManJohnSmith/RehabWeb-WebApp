import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ThemeService } from '../../../core/theme.service';
import { ToastService } from '../../../core/toast.service';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, UiIconComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Valor enviado al API como `username` (puede ser el correo si el usuario Django fue creado así). */
  username = '';
  password = '';

  protected readonly submitting = signal(false);

  constructor() {
    this.theme.initFromStorage();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  submit(ev: Event): void {
    ev.preventDefault();
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p) {
      this.toast.show('Indica usuario o correo y contraseña.');
      return;
    }

    this.submitting.set(true);
    this.auth.login(u, p).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.show('Sesión iniciada.');
        void this.router.navigateByUrl('/app/dashboard');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const body = err.error as Record<string, unknown> | string | null | undefined;
        let msg = 'No se pudo iniciar sesión.';
        if (typeof body === 'object' && body !== null) {
          const detail = body['detail'];
          const nonField = body['non_field_errors'];
          if (typeof detail === 'string') {
            msg = detail;
          } else if (Array.isArray(nonField) && typeof nonField[0] === 'string') {
            msg = nonField[0];
          }
        }
        this.toast.show(msg);
      },
    });
  }
}
