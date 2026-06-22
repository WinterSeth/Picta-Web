import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SectionService } from '../services/section.service';
import { pluck } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SectionsResolverService  {
  private sectionService = inject(SectionService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Observable<any>> | Observable<any> | Promise<any> | any {
    return this.sectionService.getSecciones(1).pipe(pluck('results'));
  }
}
