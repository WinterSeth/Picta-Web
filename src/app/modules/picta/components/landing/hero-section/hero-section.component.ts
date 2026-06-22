import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-hero-section',
    imports: [RouterLink, MatButtonModule],
    template: `
    <section class="hero-section" role="region" aria-labelledby="hero-title">
      <div class="hero-image-wrap">
        <img
          src="img/login_bg.webp"
          alt="Movie streaming background showing various entertainment content"
          class="hero-image" />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="hero-text-wrap">
          <h1 id="hero-title" class="hero-title">
            Películas y series ilimitadas y mucho más
          </h1>
          <p class="hero-subtitle">Planes a partir de CUP $25. Comienza gratis cuando quieras.</p>
          <p class="hero-hint">¿Quieres ver Picta ya? Inicia sesión con tu cuenta o regístrate si aún no lo has hecho.</p>

          <div class="hero-actions">
            <a
              routerLink="/usuario/registro"
              class="hero-cta-primary">
              REGISTRARME
            </a>
            <a
              routerLink="/usuario/acceder"
              class="hero-cta-secondary">
              INICIAR SESIÓN
            </a>
          </div>
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

      .hero-section {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .hero-image-wrap {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        max-height: 100vh;
      }

      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(5, 7, 31, 0.75) 0%,
          rgba(5, 7, 31, 0.55) 50%,
          rgba(5, 7, 31, 0.82) 100%
        );
      }

      .hero-content {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
      }

      .hero-text-wrap {
        max-width: 640px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      }

      .hero-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(2rem, 6vw, 3.5rem);
        font-weight: 400;
        letter-spacing: 0.02em;
        color: #f4f7fb;
        margin: 0 0 16px;
        line-height: 1.1;
        text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
      }

      .hero-subtitle {
        font-family: 'Abel', sans-serif;
        font-size: 1.1rem;
        color: rgba(244, 247, 251, 0.85);
        margin: 0 0 8px;
      }

      .hero-hint {
        font-family: 'Roboto', sans-serif;
        font-size: 0.95rem;
        color: rgba(244, 247, 251, 0.65);
        margin: 0 0 28px;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
      }

      .hero-cta-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 32px;
        background: var(--picta-yellow) !important;
        color: #0a1126 !important;
        border-radius: 9999px !important;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1rem;
        letter-spacing: 0.06em;
        font-weight: 500;
        text-decoration: none;
        transition: all 180ms ease;
        box-shadow: 0 8px 24px rgba(243, 230, 40, 0.3);

        &:hover {
          background: #e8d91f !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(243, 230, 40, 0.45);
        }
      }

      .hero-cta-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 32px;
        background: transparent !important;
        color: #f4f7fb !important;
        border-radius: 9999px !important;
        border: 1px solid rgba(255, 255, 255, 0.30) !important;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1rem;
        letter-spacing: 0.06em;
        font-weight: 500;
        text-decoration: none;
        transition: all 180ms ease;

        &:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.55) !important;
          transform: translateY(-2px);
        }
      }

      @media (max-width: 600px) {
        .hero-section {
          min-height: 100svh;
        }

        .hero-content {
          padding: 24px 16px;
        }

        .hero-title {
          font-size: clamp(1.6rem, 8vw, 2.2rem);
        }

        .hero-subtitle {
          font-size: 1rem;
        }

        .hero-hint {
          font-size: 0.88rem;
        }

        .hero-actions {
          flex-direction: column;
          width: 100%;
          max-width: 300px;
        }

        .hero-cta-primary,
        .hero-cta-secondary {
          width: 100%;
          text-align: center;
        }
      }
    `]
})
export class HeroSectionComponent implements OnInit {
  private readonly _authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {}
}