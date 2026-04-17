import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { ShellSidebarComponent } from '../components/shell-sidebar/shell-sidebar.component';
import { ShellTopBarComponent } from '../components/shell-top-bar/shell-top-bar.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, ShellSidebarComponent, ShellTopBarComponent],
  templateUrl: './shell-layout.component.html',
})
export class ShellLayoutComponent {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  protected readonly toast = inject(ToastService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly pageTitle = signal(this.readTitle());

  constructor() {
    this.theme.initFromStorage();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.pageTitle.set(this.readTitle()));
  }

  private readTitle(): string {
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) {
      r = r.firstChild;
    }
    const t = r.data['title'];
    return typeof t === 'string' ? t : 'Panel';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  backdropClick(): void {
    this.closeMobileMenu();
  }
}
