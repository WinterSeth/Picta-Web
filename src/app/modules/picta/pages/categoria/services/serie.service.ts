import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, Observable, of, tap} from 'rxjs';
import {Serie} from '../../medias/models/publicacion.model';
import { environment } from '../../../../../../environments/environment';

const url = `${environment.baseUrl}/v1/serie/`;
const urlV2 = `${environment.baseUrl}/v2/serie/`;

@Injectable({
  providedIn: 'root'
})
export class SerieService {
  private httpClient = inject(HttpClient);

  series = signal<any[]>([]);

  ordering = signal<string>('-last_update');
  currentPage = signal<number>(1);
  nextPage = signal<number>(1 || null);
  hasMorePages = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  // Nuevas signals para el filtro
  searchTerm = signal<string>('');
  isSearching = signal<boolean>(false);

  constructor() {}

  getSerieById(movieId: string): Observable<any> {
    return this.httpClient.get<any>(
      `${urlV2}`
    );
  }

  // Método para buscar por nombre
  searchAnimes(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.series.set([]);
    this.isSearching.set(true);
    this.getAnimes();
  }

  orderingAnimes(ordering: string) {
    this.ordering.set(ordering);
    this.currentPage.set(1);
    this.getAnimes();
  }

  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.series.set([]);
    this.isSearching.set(false);
    this.getAnimes();
  }

  getAnimes(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    const searchParam = this.searchTerm() ? `&nombre__contains=${encodeURIComponent(this.searchTerm())}` : '';

    this.httpClient
      .get<any>(`${urlV2}?page=${this.currentPage()}&page_size=20&next=${this.nextPage()}&ordering=${this.ordering()}&genero_raw=Anime${searchParam}`)
      .pipe(
        tap((response) => {
          const currentMovies = this.series();
          if (this.currentPage() === 1) {
            // Si es la primera página, reemplazar completamente
            this.series.set(response.results);
          } else {
            // Si no, agregar a los existentes
            this.series.set([...currentMovies, ...response.results]);
          }
          this.nextPage.set(response.next);
          this.hasMorePages.set(response.next > 0);
          this.currentPage.update((currentPage) => currentPage + 1);
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.isLoading.set(false);
          this.isSearching.set(false);
          console.error('Error fetching animes:', error);
          return of(null);
        })
      )
      .subscribe();
  }







  getSeries() {
    return this.httpClient.get(urlV2);
  }

  getAll(params?): Observable<any> {
    const queryParams = this.getQueryParams(params);
    return this.httpClient.get(urlV2, {params: queryParams});
  }

  loadSerie(name: string): Observable<any> {
    return this.httpClient.get<any>(`${urlV2}`, {
      params: new HttpParams().set('nombre_raw', name),
    });
  }

  getSeriesByFiltros(params: any): Observable<any> {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
    }
    return this.httpClient.get<any>(urlV2, { params: queryParameters });
  }



  get(id: number): Observable<Serie> {
    return this.httpClient.get<Serie>(`${url}${id}`);
  }

  getQueryParams = (params) => {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
    }
    return queryParameters;
  }
}
