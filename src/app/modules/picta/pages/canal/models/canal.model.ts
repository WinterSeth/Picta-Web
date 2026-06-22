import {Publication} from '../../medias/models/publicacion.model';
import {PictaResponse} from '../../../models/response.picta.model';

export interface Canal {
  'url_imagen': string,
  'url_avatar': string,
  'id': number,
  // idEprog (identificador externo para la API de programación) puede venir desde el backend
  'idEprog'?: string,
  // algunos endpoints usan 'titulo' en lugar de 'nombre'
  'titulo'?: string,
  'nombre': string,
  'descripcion': string,
  'cantidad_suscripciones': number,
  'usuario': string,
  'palabra_clave': string[],
  'prioridad': number,
  'tipo': string,
  'fecha_publicado': Date,
  'seller': any,
  'tiempo_creacion': string,
  'fecha_creacion': Date,
  'usuarios_asociados': string[],
  'usuarios_asociados_ids': number[],
  'publicado': boolean,
  'suscripcion': any,
  'slug_url': string,
  donar: boolean,
  'alias': string,
  'lista_publicaciones': PictaResponse<Publication>,
  videos: Publication[];
  planes?: { plan_canal_id: number; plan: any }[];


}
