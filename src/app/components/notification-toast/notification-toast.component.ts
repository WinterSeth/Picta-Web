import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  url?: string;
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-toast.html',
  styleUrls: ['./notification-toast.component.scss']
})
export class NotificationToastComponent implements OnInit {
  type = input<'ok' | 'notification' | 'error'>('notification');
  message = input<string>('');
  action = input<NotificationAction | null>(null);
  duration = input<number>(5000);

  closed = output<void>();

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const duration = this.duration();
    if (duration > 0) {
      const timer = setTimeout(() => this.close(), duration);
      this.destroyRef.onDestroy(() => clearTimeout(timer));
    }
  }

  onAction(): void {
    const action = this.action();
    action?.onClick();
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
