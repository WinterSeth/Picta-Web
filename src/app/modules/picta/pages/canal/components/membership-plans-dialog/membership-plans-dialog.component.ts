import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { PaymentService } from '../../../profile/services/payment.service';
import { NotificationService } from '../../../../../../services/notification.service';

@Component({
  selector: 'app-membership-plans-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIcon,
    MatButton
  ],
  template: `
    <!-- Banner + Channel Info -->
    <div class="channel-hero">
      <div class="channel-banner">
        <img [src]="canal?.url_imagen + '_960x200'" [alt]="canal?.nombre" class="banner-img" />
        <div class="banner-overlay"></div>
      </div>
      <div class="channel-info">
        <div class="avatar-wrap">
          <img [src]="canal?.url_avatar + '_300x300'" [alt]="canal?.nombre" class="channel-avatar" />
          <div class="avatar-ring"></div>
        </div>
        <div class="channel-meta">
          <h2 class="channel-name">{{ canal?.nombre }}</h2>
          <p class="channel-subs">{{ canal?.cantidad_suscripciones | number }} suscriptores</p>
        </div>
      </div>
      <div class="channel-desc">
        <p>{{ canal?.descripcion }}</p>
      </div>
    </div>

    <!-- Benefits -->
    <div class="benefits-bar">
      <div class="benefit">
        <mat-icon>workspace_premium</mat-icon>
        <span>Acceso a contenido exclusivo</span>
      </div>
    </div>

    <!-- Plans -->
    <div class="dialog-content">
      <h3 class="section-title">Elige tu plan</h3>

      @if (!canal?.planes?.length) {
        <div class="empty-state">
          <mat-icon class="empty-icon">info</mat-icon>
          <p>No hay planes disponibles</p>
        </div>
      } @else {
        <div class="plans-list">
          @for (item of canal.planes; track item.id; let i = $index) {
            <div
              class="plan-card"
              [class.plan-featured]="i === 0"
              (click)="selectPlan(item)">

              <div class="plan-left">
                <span class="plan-duration">{{ item.duracion }} días</span>
                <span class="plan-type">{{ item.internacional ? 'Internacional' : 'Nacional' }}</span>
              </div>

              <div class="plan-center">
                <h4 class="plan-name">{{ item.nombre }}</h4>
                <p class="plan-desc">{{ item.descripcion }}</p>
              </div>

              <div class="plan-right">
                <div class="plan-price">
                  <span class="currency">{{ item.moneda }}</span>
                  <span class="amount">{{ item.precio }}</span>
                </div>
                <button
                  mat-flat-button
                  class="select-btn"
                  (click)="selectPlan(item); $event.stopPropagation()">
                  Seleccionar
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="dialogRef.close()" class="close-btn">Cerrar</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: white;
    }

    /* ── Hero / Channel Header ── */
    .channel-hero {
      position: relative;
    }

    .channel-banner {
      position: relative;
      width: 100%;
      height: 140px;
      overflow: hidden;
    }

    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 40%, rgba(18, 18, 30, 0.95) 100%);
    }

    .channel-info {
      display: flex;
      align-items: flex-end;
      gap: 14px;
      padding: 0 20px;
      margin-top: -34px;
      position: relative;
      z-index: 2;
    }

    .avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .channel-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #12121e;
      display: block;
    }

    .avatar-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid rgba(243, 230, 40, 0.4);
      pointer-events: none;
    }

    .channel-meta {
      padding-bottom: 6px;
      min-width: 0;
    }

    .channel-name {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .channel-subs {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 2px 0 0;
    }

    .channel-desc {
      padding: 10px 20px 0;
    }

    .channel-desc p {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Benefits Bar ── */
    .benefits-bar {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding: 14px 20px;
      margin: 12px 16px 0;
      background: rgba(243, 230, 40, 0.06);
      border: 1px solid rgba(243, 230, 40, 0.12);
      border-radius: 10px;
    }

    .benefit {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .benefit mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      color: #f3e628;
    }

    /* ── Content ── */
    .dialog-content {
      padding: 16px 20px;
      max-height: 45vh;
      overflow-y: auto;

      &::-webkit-scrollbar { width: 5px; }
      &::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 3px; }
      &::-webkit-scrollbar-thumb { background: rgba(243,230,40,0.35); border-radius: 3px; }
      scrollbar-width: thin;
      scrollbar-color: rgba(243,230,40,0.35) rgba(255,255,255,0.04);
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 16px;
      gap: 10px;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-icon { font-size: 36px; width: 36px; height: 36px; color: rgba(255,255,255,0.25); }

    /* ── Plans List ── */
    .plans-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .plan-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .plan-card:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(243, 230, 40, 0.35);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    .plan-card.plan-featured {
      border-color: rgba(243, 230, 40, 0.25);
      background: linear-gradient(135deg, rgba(243, 230, 40, 0.07) 0%, rgba(232, 70, 46, 0.04) 100%);
    }

    .plan-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 56px;
    }

    .plan-duration {
      font-size: 1.1rem;
      font-weight: 800;
      color: #f3e628;
      line-height: 1;
    }

    .plan-type {
      font-size: 0.6rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.55);
    }

    .plan-center {
      flex: 1;
      min-width: 0;
    }

    .plan-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 3px;
    }

    .plan-desc {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .plan-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    .plan-price .currency {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .plan-price .amount {
      font-size: 1.2rem;
      font-weight: 800;
      color: #fff;
    }

    .select-btn {
      height: 32px;
      padding: 0 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f3e628 0%, #e8c520 100%);
      color: #1a1a2e;
      font-weight: 600;
      font-size: 0.75rem;
      transition: all 0.2s ease;
    }

    .select-btn:hover {
      background: linear-gradient(135deg, #ffe94a 0%, #f3e628 100%);
      box-shadow: 0 3px 10px rgba(243, 230, 40, 0.35);
    }

    /* ── Footer ── */
    .dialog-footer {
      padding: 10px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: center;
    }

    .close-btn {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      border-radius: 8px;
    }

    .close-btn:hover {
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.07);
    }
  `]
})
export class MembershipPlansDialogComponent {
  dialogRef = inject(MatDialogRef<MembershipPlansDialogComponent>);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  data = inject<{ canal?: any }>(MAT_DIALOG_DATA);

  canal = this.data?.canal;

  selectPlan(plan: any): void {
    const externalId = `suscripcion_canal_${plan.id}`;
    
    this.paymentService.getItem({ external_id: externalId }).subscribe({
      next: (data: any) => {
        if (data.results.length) {
          this.dialogRef.close({ plan, offer: data.results[0], externalId });
        } else {
          this.notificationService.open('error', 'No existe una oferta para este plan');
        }
      },
      error: (err) => {
        console.error('Error getting payment item:', err);
        this.notificationService.open('error', 'Error al procesar el pago');
      }
    });
  }
}
