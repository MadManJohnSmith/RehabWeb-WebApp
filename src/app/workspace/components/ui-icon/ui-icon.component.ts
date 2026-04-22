import { isPlatformBrowser } from '@angular/common';
import {
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
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MoreVertical,
  Moon,
  MonitorPlay,
  Search,
  Send,
  Settings,
  Sun,
  Users,
  createElement,
} from 'lucide';

/** Identificadores de iconos Lucide admitidos en la app (subset). */
export type UiIconName =
  | 'activity'
  | 'alert-triangle'
  | 'bar-chart'
  | 'bell'
  | 'chart-column'
  | 'chevron-left'
  | 'chevron-right'
  | 'circle-check'
  | 'download'
  | 'file-spreadsheet'
  | 'file-text'
  | 'history'
  | 'layout-dashboard'
  | 'lock'
  | 'log-out'
  | 'mail'
  | 'menu'
  | 'more-vertical'
  | 'moon'
  | 'monitor-play'
  | 'search'
  | 'send'
  | 'settings'
  | 'sun'
  | 'users';

const MAP: Record<UiIconName, typeof LayoutDashboard> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  'bar-chart': ChartColumn,
  bell: Bell,
  'chart-column': ChartColumn,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  download: Download,
  'file-spreadsheet': FileSpreadsheet,
  'file-text': FileText,
  history: History,
  'layout-dashboard': LayoutDashboard,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  menu: Menu,
  'more-vertical': MoreVertical,
  moon: Moon,
  'monitor-play': MonitorPlay,
  search: Search,
  send: Send,
  settings: Settings,
  sun: Sun,
  users: Users,
};

@Component({
  selector: 'app-ui-icon',
  standalone: true,
  template:
    '<span #host class="inline-flex shrink-0 items-center justify-center text-current [&>svg]:block [&>svg]:shrink-0" [style.width.px]="size()" [style.height.px]="size()"></span>',
})
export class UiIconComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = viewChild<ElementRef<HTMLSpanElement>>('host');

  readonly name = input.required<UiIconName>();
  readonly size = input(20);
  readonly svgClass = input('');

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const ref = this.host();
      if (!ref) {
        return;
      }
      const el = ref.nativeElement;
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
  }
}
