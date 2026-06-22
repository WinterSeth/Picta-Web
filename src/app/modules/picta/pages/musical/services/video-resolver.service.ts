import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PublicationService } from '../../medias/services/publication-service';
import { map } from 'rxjs';
import { Publication } from '../../medias/models/publicacion.model';
@Injectable({
  providedIn: 'root',
})
export class VideoResolverService  {
  private service = inject(PublicationService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Publication> | Promise<Publication> | Publication {
    const slug = route.paramMap.get('slug_url');
    return this.service.loadPublication(slug).pipe(
      map((response) => {
        return response.results;
      })
    );
  }
}
