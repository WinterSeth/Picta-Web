import { Observable } from 'rxjs/internal/Observable';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, pluck, throwError } from 'rxjs';
import { UtilsService } from '../../../../../services/utils.service';
import { Publication } from '../models/publicacion.model';
import { environment } from '../../../../../../environments/environment';

declare var adress: any;

const url = `${environment.baseUrl}/v2/publicacion/`;
const urldescargas = `${environment.baseUrl}/v2/publicacion/`;
const urlSerie = `${environment.baseUrl}/v2/serie/`;
const url2 = `${environment.baseUrl}/v1/publicacion/`;
const urlDownload = `${environment.baseUrl}/v1/descarga/`;
const lista_reproduccion = `${environment.baseUrlV2}/lista_reproduccion_canal/listar_recomendados/`;

export interface VideoShort {
  id: number;
  nombre: string;
  slug_url: string;
  url_manifiesto: string; // Cambiamos videoUrl por url_manifiesto
  url_imagen: string;
  duracion: number;
  cantidad_visitas: number;
  mostrar_comentarios: boolean;
  lista_comentarios: any;
  canal: {
    id: number;
    nombre: string;
    url_avatar: string;
    alias: string;
  };
  cantidad_me_gusta: number;
  cantidad_no_me_gusta: number;
  cantidad_comentarios: number;
  fecha_creacion: string;
  categoria: any;
}

export interface ShortsResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: VideoShort[];
}

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private readonly httpClient = inject(HttpClient);
  private readonly utilesService = inject(UtilsService);

  public getPublications(params: any): Observable<any> {
    const queryParameters = this.getQueryParams(params);
    return this.httpClient.get<any>(url, {
      params: queryParameters,
    });
  }

  public getSeries(params: any): Observable<any> {
    const queryParameters = this.getQueryParams(params);
    return this.httpClient.get<any>(urlSerie, {
      params: queryParameters,
    });
  }

  getShortsCarousel(
    weekAgo: string,
    currenDate: string,
  ): Observable<ShortsResponse> {
    const params = new HttpParams()
      .set('page', '1')
      .set('page_size', '10')
      .set('ordering', '-cantidad_visitas')
      .set('fecha_publicado__lt', weekAgo)
      .set('fecha_publicado__gte', currenDate)
      .set('tipologia_nombre_raw__in', 'Shorts');

    return this.httpClient.get<ShortsResponse>(url, { params });
  }

  getShorts(page: number = 1): Observable<ShortsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', '10')
      .set('tipologia_nombre_raw', 'Shorts');

    return this.httpClient.get<ShortsResponse>(url, { params }).pipe(
      map(response => ({
        ...response,
        results: response.results.map(short => this.transformShortUrls(short)),
      })),
    );
  }

  getShortBySlug(slug: string): Observable<VideoShort> {
    return this.httpClient
      .get<ShortsResponse>(
        `${url}?slug_url_raw=${slug}&tipologia_nombre_raw=Shorts`,
      )
      .pipe(
        map(response => {
          if (response.results && response.results.length > 0) {
            return this.transformShortUrls(response.results[0]);
          } else {
            throw new Error('Short not found');
          }
        }),
      );
  }

  private transformShortUrls(short: VideoShort): VideoShort {
    return {
      ...short,
      url_manifiesto: this.ensureHlsUrl(short.url_manifiesto),
      url_imagen: short.url_imagen + '_80x80',
      canal: {
        ...short.canal,
        url_avatar: short.canal.url_avatar + '_80x80',
      },
    };
  }

  private addImageSizeSuffix(url: string, size: string): string {
    if (!url) return url;

    // Remover cualquier query string existente
    const [baseUrl, query] = url.split('?');

    // Si ya tiene un sufijo de tamaño, reemplazarlo
    if (baseUrl.includes('_')) {
      const urlWithoutSuffix = baseUrl.split('_')[0];
      const newUrl = `${urlWithoutSuffix}_${size}`;
      return query ? `${newUrl}?${query}` : newUrl;
    }

    // Si no tiene sufijo, agregarlo
    const newUrl = `${baseUrl}_${size}`;
    return query ? `${newUrl}?${query}` : newUrl;
  }

  private ensureHlsUrl(url: string): string {
    if (url.endsWith('.mpd')) {
      return url.replace('manifest.mpd', 'master.m3u8');
    }
    return url;
  }

  getVideosRecomendados(id: any): Observable<any[]> {
    let queryParameters = new HttpParams().set('id_publicacion', id);
    return this.httpClient
      .get<any>(`${lista_reproduccion}`, { params: queryParameters })
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getEpisodiosbyTemporadaId(id: any): Observable<any> {
    let queryParameters = new HttpParams().set('temporada_id', id);
    return this.httpClient.get<any>(`${url}`, { params: queryParameters }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error code: ${error.status}; message : ${error.message}`;
        }

        return throwError(() => errorMessage);
      }),
      map(response => {
        return response.results;
      }),
    );
  }

  public loadPublicationsFromChanel(canal: any, params): Observable<any> {
    let queryParameters = this.getQueryParams(params);
    queryParameters = queryParameters.set('canal_nombre_raw', canal.nombre);

    return this.httpClient.get<any>(url, {
      params: queryParameters,
    });
  }

  public loadPublicationsFromChanelByFilters(params): Observable<any> {
    const queryParameters = this.getQueryParams(params);

    return this.httpClient.get<any>(url, {
      params: queryParameters,
    });
  }

  loadPublication(slug_url: string): Observable<any> {
    return this.httpClient.get<any>(`${url}`, {
      params: new HttpParams().set('slug_url_raw', slug_url),
    });
  }

  getByFiltros(filtros: any, page?: string, page_size?: string) {
    let queryParams = this.getQueryParamsFromFilters(filtros);
    queryParams = queryParams.append('page_size', page_size ? page_size : '10');
    queryParams = queryParams.append('page', page ? page : '1');
    return this.httpClient.get(url, {
      params: queryParams,
    });
  }

  getByTipoContenido(tipo: string): Observable<Publication[]> {
    return this.httpClient
      .get<any>(`${url}?canal_nombre_raw=Televisión en vivo`)
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByLastWeek(
    currenDate: string,
    weekAgo: string,
    monthAgo: string,
  ): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?fecha_publicado__gte=` +
          monthAgo +
          `&fecha_publicado__lt=` +
          currenDate +
          `&ordering=-cantidad_visitas&page=1&page_size=10&tipo__in=publicacion`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getLandingData(): Observable<any> {
    return this.httpClient.get<any>(`${url}tendencias/?pais=Cuba`);
  }

  getByCubanMovie(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?ordering=-cantidad_visitas&pais__wildcard=Cuba&tipologia_nombre_raw=Película&page=1&page_size=10`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByCubanSerie(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?ordering=-last_update&pais__wildcard=Cuba&tipologia_nombre_raw=Serie&page=1&page_size=10&genero_raw_exclude=Novela__Show__Anime__Dorama__Deportivo`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getBySerie(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?tipologia_nombre_raw=Serie&page=1&page_size=10&genero_raw_exclude=Novela__Show__Anime__Dorama__Videojuego__Infantil__Deportivo`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getBySerieLastUpdate(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?tipologia_nombre_raw=Serie&page=1&page_size=10&ordering=-last_update&genero_raw_exclude=Novela__Show__Anime__Dorama__Videojuego__Infantil__Deportivo`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByShowLastUpdate(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?genero_raw=Show&page=1&page_size=10&ordering=-last_update`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByNovelaLastUpdate(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?genero_raw=Novela&genero_raw_exclude=Dorama&page=1&page_size=10&ordering=-last_update`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByAnimeLastUpdate(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?genero_raw=Anime&page=1&page_size=10&ordering=-last_update`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByDoramaLastUpdate(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${urlSerie}?genero_raw=Dorama&page=1&page_size=10&ordering=-last_update`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByMovieLastTime(
    currenDate: string,
    weekAgo: string,
  ): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?fecha_publicado__gte=` +
          weekAgo +
          `&fecha_publicado__lt=` +
          currenDate +
          `&ordering=-cantidad_visitas&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getNewestMovies(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?ordering=-fecha_publicado&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getNewestCubanMovies(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?ordering=-fecha_publicado&pais__wildcard=Cuba&tipologia_nombre_raw__in=Película&page=1&page_size=10`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getPopularPaidMovies(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?precios__isnull=false&ordering=-cantidad_me_gusta&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getPaidMoviesByOrder(ordering: string): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?precios__isnull=false&ordering=${ordering}&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getLatestPaidMovies(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?precios__isnull=false&ordering=-fecha_publicado&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getBySerieLastTime(
    currenDate: string,
    weekAgo: string,
  ): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?fecha_publicado__gte=` +
          weekAgo +
          `&fecha_publicado__lt=` +
          currenDate +
          `&ordering=-cantidad_visitas&page=1&page_size=10&tipologia_nombre_raw=Serie&genero_raw_exclude=Anime`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByAnimeLastTime(
    currenDate: string,
    weekAgo: string,
  ): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?fecha_publicado__gte=` +
          weekAgo +
          `&fecha_publicado__lt=` +
          currenDate +
          `&genero_raw=Anime&ordering=-cantidad_visitas&page=1&page_size=10`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByLikesLastTimeMovie(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?ordering=-cantidad_me_gusta&page=1&page_size=10&tipologia_nombre_raw__in=Película`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByLikesLastTimeSerie(
    currenDate: string,
    weekAgo: string,
  ): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?fecha_publicado__gte=` +
          weekAgo +
          `&fecha_publicado__lt=` +
          currenDate +
          `&ordering=-cantidad_visitas&page=1&page_size=10&tipologia_nombre_raw__in=Serie&genero_raw_exclude=Anime`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getByAllTime(): Observable<Publication[]> {
    return this.httpClient
      .get<any>(
        `${url}?ordering=-cantidad_visitas&page=1&page_size=10&tipo__in=publicacion`,
      )
      .pipe(
        map(response => {
          return response.results;
        }),
      );
  }

  getQueryParamsFromFilters = filters => {
    let queryParameters = new HttpParams();
    for (let filter of filters) {
      queryParameters = queryParameters.append(filter.key, filter.value);
    }
    return queryParameters;
  };
  getQueryParams = params => {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
    }
    return queryParameters;
  };

  countReproduccion(publicacionId: number, user?: boolean) {
    const visit = new FormData();
    visit.append('publicacion', publicacionId.toString());
    if (user) {
      visit.append('usuario', 'true');
    }
    return this.httpClient.post(
      `${environment.baseUrl}/v1/reproduccion/`,
      visit,
    );
  }

  countVisit(publicacionId: number, ip: string, user: string) {
    const visit = new FormData();
    visit.append('publicacion', publicacionId.toString());
    visit.append('direccion_ip', ip.toString());
    visit.append('usuario', user.toString());
    return this.httpClient.post(`${environment.baseUrl}/v1/visita/`, visit);
  }

  updateSeeingNow(idPublicacion: number, isSeeing: boolean) {
    const fd = new FormData();
    fd.append('nueva_vista', isSeeing.toString());
    return this.httpClient.patch(`${url2}${idPublicacion}/`, fd);
  }

  countDownload(idPublicacion) {
    const body = new FormData();
    body.append('publicacion', idPublicacion);
    return this.httpClient.post(urlDownload, body);
  }

  getDownloadUrl(data: { id: number; calidad: string }) {
    const params = this.utilesService.getQueryParams(data);
    return this.httpClient.get(`${url}get_url_descarga/`, {
      params,
    });
  }

  getDownloads() {
    return this.httpClient
      .get(`${url}get_descargas/`)
      .pipe(map((resp: any) => resp.descargas));
  }
}
