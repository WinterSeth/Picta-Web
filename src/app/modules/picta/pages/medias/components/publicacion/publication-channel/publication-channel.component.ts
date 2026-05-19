import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, UpperCasePipe, SlicePipe } from '@angular/common';
import { ShortNumbersPipe } from '../../../pipes/short-numbers.pipe';
import { Canal } from '../../../../canal/models/canal.model';

@Component({
  selector: 'app-publication-channel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'publication-channel',
  },
  template: `
    @if (canal()) {
      <div class="channel-info flex flex-row items-center gap-2">
        <img
          [alt]="canal()!.nombre"
          class="!rounded-full h-9 w-9"
          width="38"
          height="38"
          [ngSrc]="canal()!.url_avatar + '_40x40'"
        />
        <div class="flex flex-col self-center ml-2 min-w-0 overflow-hidden">
          <a
            [routerLink]="['/canal', canal()!.alias]"
            class="block overflow-hidden text-ellipsis whitespace-nowrap"
            >{{ canal()!.nombre }}</a
          >
          <span class="text-xs text-gray-500">{{
            canal()!.cantidad_suscripciones !== 0
              ? (canal()!.cantidad_suscripciones | shortNumbers)
              : 0
          }}
            seguidores</span
          >
        </div>
        <div class="flex flex-wrap items-center gap-2">
          @if (canal()!.donar && canal()!.seller) {
            <button
              class="mr-2 !rounded-full donate-button"
              #tooltip33="matTooltip"
              (click)="
                isLoggedIn()
                  ? donateClick.emit()
                  : tooltip33.toggle()
              "
              [matTooltip]="
                isLoggedIn()
                  ? 'Enviar donación'
                  : 'Debes estar autenticado para donate'
              "
              mat-stroked-button
            >
              <mat-icon>attach_money</mat-icon>Donar
            </button>
          }
          @if (!subscribed()) {
            <button
              #tooltip="matTooltip"
              (click)="
                isLoggedIn()
                  ? subscribeClick.emit()
                  : tooltip.toggle()
              "
              [matTooltip]="
                isLoggedIn() ? 'Seguir' : 'Debes estar autenticado para seguir'
              "
              class="channel-follow-button"
              [class.is-subscribing]="subscribing()"
              [disabled]="
                subscribing() || subscriptionLoading() || !isLoggedIn()
              "
              mat-stroked-button
            >
              <div class="flex items-center justify-center gap-2">
                @if (subscribing() || subscriptionLoading()) {
                  <mat-progress-spinner
                    diameter="18"
                    mode="indeterminate"
                    color="accent"
                  ></mat-progress-spinner>
                }
                <span class="channel-follow-label text-black"
                  >Seguir</span
                >
              </div>
            </button>
          } @else {
            <button
              [matMenuTriggerFor]="subscribeMenu"
              (click)="$event.stopPropagation()"
              title="Opciones de seguimiento"
              class="channel-follow-button subscribed"
              [class.is-subscribing]="subscribing()"
              [disabled]="
                subscribing() || subscriptionLoading() || !isLoggedIn()
              "
              mat-stroked-button
            >
              @if (subscribing() || subscriptionLoading()) {
                <mat-progress-spinner
                  diameter="18"
                  mode="indeterminate"
                  color="accent"
                ></mat-progress-spinner>
              } @else {
                <mat-icon>{{
                  notificationMode() === 'all'
                    ? 'notifications_active'
                    : 'notifications_off'
                }}</mat-icon>
              }
              <span class="channel-follow-label text-black"
                >Siguiendo</span
              >
            </button>
            <mat-menu #subscribeMenu="matMenu" class="subscribe-menu header-menu-panel">
              <button
                mat-menu-item
                (click)="notificationChange.emit('all')"
                [class.active]="notificationMode() === 'all'"
              >
                <mat-icon>notifications_active</mat-icon>
                <span>Todas</span>
              </button>
              <button
                mat-menu-item
                (click)="notificationChange.emit('none')"
                [class.active]="notificationMode() === 'none'"
              >
                <mat-icon>notifications_off</mat-icon>
                <span>Ninguna</span>
              </button>
              <button mat-menu-item (click)="unsubscribeClick.emit()">
                <mat-icon>close</mat-icon>
                <span>Dejar de seguir</span>
              </button>
            </mat-menu>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .channel-info img {
      transition:
        transform var(--pub-fast) var(--pub-ease),
        box-shadow var(--pub-fast) var(--pub-ease);
    }

    .channel-info img:hover {
      transform: scale(1.1);
      box-shadow: 0 0 0 2px rgba(232, 70, 46, 0.45);
    }

    .channel-follow-button {
      --mat-button-outlined-container-shape: 999px;
      --mat-button-outlined-outline-color: rgba(255, 255, 255, 0.14);
      --mat-button-outlined-label-text-color: #1a1a2e;
      --mat-button-outlined-state-layer-color: #e8462e;
      --mat-button-outlined-ripple-color: rgba(232, 70, 46, 0.16);

      min-width: 0;
      height: 38px;
      padding: 0 0.95rem;
      background: #ffffff;
      box-shadow: none;
      transition:
        background-color var(--pub-fast) var(--pub-ease),
        border-color var(--pub-fast) var(--pub-ease),
        color var(--pub-fast) var(--pub-ease),
        transform var(--pub-fast) var(--pub-ease);
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .channel-follow-button[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
      background: #f0f0f0 !important;
    }

    .channel-follow-button:hover {
      background: rgba(255, 255, 255, 0.85);
      --mat-button-outlined-outline-color: rgba(232, 70, 46, 0.3);
      transform: translateY(-1px);
    }

    .channel-follow-button:active {
      transform: scale(0.97);
    }

    /* Subscribed state with picta-yellow */
    .channel-follow-button.subscribed {
      background: var(--picta-yellow, #f3e628);
      --mat-button-outlined-outline-color: var(
        --picta-yellow-border,
        rgba(243, 230, 40, 0.28)
      );
      --mat-button-outlined-label-text-color: #111;
      box-shadow: none;
    }

    .channel-follow-button.subscribed .mat-icon {
      color: #111;
    }

    .channel-follow-button .mat-icon {
      margin-right: 0.35rem;
      color: #e8462e;
    }

    .channel-follow-button span {
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .donate-button {
      --mat-button-outlined-container-shape: 999px;
      min-width: 0;
      height: 38px;
      padding: 0 0.95rem;
    }
  `,
  imports: [
    MatProgressSpinner,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    RouterLink,
    NgOptimizedImage,
    UpperCasePipe,
    SlicePipe,
    ShortNumbersPipe,
  ],
})
export class PublicationChannelComponent {
  // Required inputs
  canal = input.required<Canal>();

  // Optional inputs with defaults
  isLoggedIn = input(false, { transform: booleanAttribute });
  subscribed = input(false, { transform: booleanAttribute });
  subscribing = input(false, { transform: booleanAttribute });
  subscriptionLoading = input(false, { transform: booleanAttribute });
  notificationMode = input<'all' | 'none'>('all');

  // Outputs
  subscribeClick = output<void>();
  unsubscribeClick = output<void>();
  notificationChange = output<'all' | 'none'>();
  donateClick = output<void>();
}