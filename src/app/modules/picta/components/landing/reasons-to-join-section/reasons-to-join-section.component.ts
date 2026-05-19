import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChild, faDownload, faMobileAlt, faRadio, faTv } from '@fortawesome/free-solid-svg-icons';
import { ReasonDialogComponent } from '../reason-dialog/reason-dialog.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-reasons-to-join-section',
    imports: [FontAwesomeModule, NgClass],
    standalone: true,
    template: `
    <section class="reasons-section" aria-labelledby="reasons-heading">
      <div class="reasons-wrapper">
        <h2 id="reasons-heading" class="reasons-heading">Más motivos para unirte</h2>
        <div class="reasons-grid" role="list">
          @for (reason of reasons; track $index) {
            <div
              class="reason-card"
              (click)="openReasonDialog($index)"
              role="listitem"
              tabindex="0"
              [attr.aria-label]="reason.title + ': ' + reason.description">
              <div class="reason-icon-wrap">
                <fa-icon [icon]="reason.icon" [ngClass]="reason.iconColor" aria-hidden="true"></fa-icon>
              </div>
              <h3 class="reason-title">{{ reason.title }}</h3>
              <p class="reason-desc">{{ reason.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
    styles: [`
      :host {
        --picta-yellow: #f3e628;
        --picta-yellow-soft: rgba(243, 230, 40, 0.16);
        --picta-yellow-softer: rgba(243, 230, 40, 0.08);
        --picta-yellow-border: rgba(243, 230, 40, 0.28);
        --picta-text-muted: rgba(244, 247, 251, 0.6);
        --picta-accent: #e8462e;
        display: block;
      }

      .reasons-section {
        padding: 48px 16px;
        background: #090d22;
      }

      .reasons-wrapper {
        max-width: 1280px;
        margin: 0 auto;
      }

      .reasons-heading {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 400;
        letter-spacing: 0.03em;
        color: #f4f7fb;
        margin: 0 0 24px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--picta-yellow-border);
      }

      .reasons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
      }

      .reason-card {
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: 
          radial-gradient(
            circle at top right,
            var(--picta-yellow-softer),
            transparent 34%
          ),
          linear-gradient(
            180deg,
            rgba(10, 17, 38, 0.98) 0%,
            rgba(16, 25, 53, 0.98) 100%
          );
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        cursor: pointer;
        transition: all 200ms ease;
        display: flex;
        flex-direction: column;
        gap: 12px;

        &:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: var(--picta-yellow-border);
          box-shadow: 0 16px 36px -16px rgba(243, 230, 40, 0.18);

          .reason-icon-wrap {
            color: var(--picta-yellow);
          }
        }

        &:focus-visible {
          outline: 2px solid rgba(243, 230, 40, 0.6);
          outline-offset: 2px;
        }
      }

      .reason-icon-wrap {
        color: var(--picta-yellow-border);
        transition: color 200ms ease;

        fa-icon {
          font-size: 2.4rem;
        }
      }

      .reason-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.1rem;
        font-weight: 400;
        letter-spacing: 0.02em;
        color: #f4f7fb;
        margin: 0;
      }

      .reason-desc {
        font-family: 'Roboto', sans-serif;
        font-size: 0.9rem;
        color: var(--picta-text-muted);
        margin: 0;
        line-height: 1.5;
      }

      @media (max-width: 600px) {
        .reasons-section {
          padding: 28px 8px;
        }

        .reasons-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .reason-card {
          padding: 20px;
        }
      }
    `]
})
export class ReasonsToJoinSectionComponent {
  private readonly _library = inject(FaIconLibrary);
  private dialog = inject(MatDialog);

  constructor() {
    this._library.addIcons(faTv, faDownload, faMobileAlt, faChild, faRadio);
  }

  openReasonDialog(index: any): void {
      this.dialog.open(ReasonDialogComponent, {
        width: '900px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        panelClass: 'picta-dark-dialog',
        data: this.reasons[index]
      });
  }

  reasons = [
    {
      icon: faTv,
      type: 'tv',
      iconColor: 'text-yellow-400',
      title: 'Disfruta en tu TV',
      description: 'Puedes disfrutar de Picta en tu Smart TV usando la aplicación "Picta TV"',
      dialog: 'Puedes disfrutar de Picta en tu Smart TV usando la aplicación "Picta TV". ¡Disfruta del contenido que Picta te ofrece desde la comodidad de tu casa! "Picta TV" se encuentra disponible para descargar totalmente gratis desde la Tienda de Aplicaciones cubanas Apklis (www.apklis.cu).'
    },
    {
      icon: faDownload,
      iconColor: 'text-yellow-400',
      type: 'download',
      title: 'Descarga tus series para verlas offline',
      description: 'Guarda tu contenido favorito y siempre tendrás algo para ver.',
      dialog: 'Guarda tus series y películas favoritas para verlas sin conexión a internet. Perfecto para cuando viajes o tengas conexión limitada.'
    },
    {
      icon: faMobileAlt,
      iconColor: 'text-yellow-400',
      type: 'mobile',
      title: 'Disfruta donde quieras',
      description: 'Películas, series, documentales y mucho más disponibles en tu teléfono.',
      dialog: 'Accede a todo el catálogo de Picta desde tu dispositivo móvil. La experiencia está optimizada para pantallas pequeñas y conexiones lentas.'
    },
    {
      icon: faRadio,
      iconColor: 'text-yellow-400',
      type: 'radio',
      title: 'CubanDJsPro Radio',
      description: 'Tu destino musical para los ritmos más vibrantes y las mejores mezclas.',
      dialog: 'Escucha radio en vivo con los mejores DJ cubanos. Música las 24 horas, sin interrupciones y con la mejor selección musical de la isla.'
    }
  ];
}