import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { UiIconComponent, UiIconName } from '../ui-icon/ui-icon.component';

export type ShellNavItem = {
  path: string;
  label: string;
  icon: UiIconName;
  /** `false` = resalta también en rutas hijas (p. ej. `/app/pacientes/:id`). */
  linkActiveExact?: boolean;
};

@Component({
  selector: 'app-shell-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UiIconComponent],
  templateUrl: './shell-sidebar.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 0 0 auto;
      align-self: stretch;
      min-height: 0;
      height: 100%;
      max-height: 100%;
      width: fit-content;
      max-width: 100%;
    }
  `,
})
export class ShellSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly closeMobile = output<void>();

  /** Navegación principal alineada al brief de producto (Figma). */
  readonly mainMenuItems: ShellNavItem[] = [
    { path: '/app/dashboard', label: 'Tablero de control', icon: 'activity', linkActiveExact: true },
    { path: '/app/pacientes', label: 'Pacientes', icon: 'users', linkActiveExact: false },
    { path: '/app/comparativa', label: 'Comparativa de desempeño', icon: 'chart-column', linkActiveExact: true },
    { path: '/app/alertas', label: 'Alertas de inactividad', icon: 'bell', linkActiveExact: true },
    { path: '/app/historial-sesiones', label: 'Historial de sesiones', icon: 'history', linkActiveExact: true },
    { path: '/app/reportes', label: 'Generación de reportes', icon: 'file-text', linkActiveExact: true },
  ];

  protected readonly collapsed = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  onNavigate(): void {
    this.closeMobile.emit();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
