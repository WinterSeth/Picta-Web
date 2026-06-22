import { Component, OnInit, PLATFORM_ID, input, inject } from '@angular/core';
import {Router} from '@angular/router';
import { isPlatformBrowser, DatePipe, NgOptimizedImage } from '@angular/common';
import { CapitalLeadPipe } from '../../../pages/medias/pipes/capital-lead.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-notificacion-item',
    templateUrl: './notificacion-item.component.html',
    styleUrls: ['./notificacion-item.component.scss'],
    imports: [MatTooltip, MatIconButton, MatIcon, DatePipe, CapitalLeadPipe, NgOptimizedImage]
})
export class NotificacionItemComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  readonly notification = input<any>(undefined);
  readonly fixedWidth = input(true);
  show;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  get tooltip() {
    switch (this.notification().tipo) {
      case 'publicacion_nueva':
        return 'Ver publicación';
      case 'publicacion_convertida':
        return 'Administrar';
      case 'notificacion_comentario':
        return 'Ir al comentario';
      case 'notificacion_issue_report':
        return 'Ver reporte';
      default:
        return 'Ver detalles'; // Valor por defecto para tipos desconocidos
    }
  }

  ngOnInit() {
  }

  errorloadingimg() {
    this.show = true;
  }

  goTo() {
    const notification = this.notification();
    if (notification.tipo === 'notificacion_api' || notification.tipo === 'notificacion_issue_report')
      return;
    if (notification.tipo !== 'publicacion_convertida') {
      if (notification.tipo === 'notificacion_comentario') {
        this.router.navigate(['/medias', notification.comentario.publicacion.slug_url],
         /*  {
            state: {
              commentId: this.notification.comentario.comentario.id
            }
          } */);
      } else if (notification.tipo === 'notificacion_solicitud') {
        if (isPlatformBrowser(this.platformId)) {
          if (notification.solicitud.tipo === 'seller') {
            window.open('https://admin.picta.cu/solicitud', '_blank');
          }
          if (notification.solicitud.tipo === 'creacion_canal') {
            window.open('https://admin.picta.cu/solicitud-canal', '_blank');
          }
        }
      } else {
        this.router.navigate(['/medias', notification.publicacion.slug_url]);
      }
    } else {
      if (isPlatformBrowser(this.platformId)) {
        window.open('https://admin.picta.cu/publicaciones', '_blank');
      }
    }
  }
}
