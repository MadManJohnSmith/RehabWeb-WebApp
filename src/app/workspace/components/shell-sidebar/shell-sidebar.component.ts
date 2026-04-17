import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiIconComponent, UiIconName } from '../ui-icon/ui-icon.component';

type NavItem = { path: string; label: string; icon: UiIconName };

@Component({
  selector: 'app-shell-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UiIconComponent],
  templateUrl: './shell-sidebar.component.html',
})
export class ShellSidebarComponent {
  readonly closeMobile = output<void>();

  readonly items: NavItem[] = [
    { path: '/app/dashboard', label: 'Tablero', icon: 'layout-dashboard' },
    { path: '/app/alertas', label: 'Alertas de inactividad', icon: 'bell' },
    { path: '/app/reportes', label: 'Generación de reportes', icon: 'file-text' },
    { path: '/app/monitoreo', label: 'Monitoreo remoto', icon: 'monitor-play' },
  ];

  onNavigate(): void {
    this.closeMobile.emit();
  }
}
