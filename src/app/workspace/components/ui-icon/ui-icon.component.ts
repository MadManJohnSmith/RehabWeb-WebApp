import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  Activity,
  AlertTriangle,
  Bell,
  CircleCheck,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  MonitorPlay,
  Send,
  Sun,
  Users,
  createElement,
} from 'lucide';

/** Identificadores de iconos Lucide admitidos en la app (subset). */
export type UiIconName =
  | 'activity'
  | 'alert-triangle'
  | 'bell'
  | 'circle-check'
  | 'download'
  | 'file-spreadsheet'
  | 'file-text'
  | 'layout-dashboard'
  | 'lock'
  | 'log-out'
  | 'mail'
  | 'menu'
  | 'moon'
  | 'monitor-play'
  | 'send'
  | 'sun'
  | 'users';

const MAP: Record<UiIconName, typeof LayoutDashboard> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  bell: Bell,
  'circle-check': CircleCheck,
  download: Download,
  'file-spreadsheet': FileSpreadsheet,
  'file-text': FileText,
  'layout-dashboard': LayoutDashboard,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  menu: Menu,
  moon: Moon,
  'monitor-play': MonitorPlay,
  send: Send,
  sun: Sun,
  users: Users,
};

@Component({
  selector: 'app-ui-icon',
  standalone: true,
  template: '<span #host class="inline-flex shrink-0 items-center justify-center text-current"></span>',
})
export class UiIconComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = viewChild.required<ElementRef<HTMLSpanElement>>('host');

  readonly name = input.required<UiIconName>();
  readonly size = input(20);
  readonly svgClass = input('');

  constructor() {
    afterNextRender(() => {
      effect(() => {
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        const el = this.host().nativeElement;
        const iconName = this.name();
        const iconNode = MAP[iconName];
        if (!iconNode) {
          return;
        }
        el.replaceChildren();
        const svg = createElement(iconNode, {
          class: this.svgClass(),
          width: this.size(),
          height: this.size(),
          stroke: 'currentColor',
        });
        el.appendChild(svg);
      });
    });
  }
}
