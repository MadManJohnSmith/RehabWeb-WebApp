import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);

  show(text: string, durationMs = 4200): void {
    const id =
      typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.messages.update((m) => [...m, { id, text }]);
    globalThis.setTimeout?.(() => this.dismiss(id), durationMs);
  }

  dismiss(id: string): void {
    this.messages.update((m) => m.filter((x) => x.id !== id));
  }
}
