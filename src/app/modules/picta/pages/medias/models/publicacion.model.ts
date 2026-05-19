import {Canal} from '../../canal/models/canal.model';
import {Comentario} from './comentario.model';
import {PictaResponse} from '../../../models/response.picta.model';

export interface Tipologia {
  nombre: string;
  modelo: string;
}

export interface Extra {
  id: number;
  tipo: string;
  nombre: string;
}

export interface Persona {
  id: number;
  nombre: string;
}

export interface Genero {
  id: number;
  nombre: string;
}

export interface Pelicula {
  ano: string;
  pais: string;
  productora: Extra[];
  premio: Extra[];
  director: Persona[];
  guion: Persona[];
  musica: Persona[];
  fotografia: Persona[];
  reparto: Persona[];
  genero: Genero[];
  imagen_secundaria: string;
}

export interface Serie {
  pelser_id: number;
  nombre: string;
  ano: string;
  pais: string;
  imagen_secundaria: string;
  url_imagen?: string;
  sinopsis?: string;
  productividad?: Extra[];
  director?: Persona[];
  guion?: Persona[];
  musica?: Persona[];
  fotografia?: Persona[];
  reparto?: Persona[];
  cantidad_capitulos: number;
  cantidad_temporadas: number;
  canal: Canal;
  genero: Genero[];
}

export interface Temporada {
  id: number;
  nombre: string;
  cantidad_capitulos: number;
  canal: Canal;
  serie: Serie;
  videos?: Publication[];
  next?: any;
  title?: any;
  subtitle?: any;
}

export interface Capitulo {
  id: number;
  numero: number;
  temporada: Temporada;
}

export interface Video {
  ano: string;
  genero: Genero[];
  interprete?: Persona[];
  productor?: Persona[];
  director?: Persona[];


}

export interface Documental {
  id: number;
  pais: string;
  productora: Extra[];
}

export interface Videoclip {
  id: number;
}

export interface Disco {
  id: number;
  imagen: string;
  duracion: number;
  casa_disquera: any [];
  interprete: Persona [];
  genero: Genero [];
  canal: Canal;
}

export interface Audio {
  ano?: number;
  pais?: string;
  interprete: Persona[];
  productor: any[];
  genero: Genero [];
  disco: Disco;

}

export interface Categoria {
  audio?: Audio;
  cancion?: any;
  videoclip?: any;
  tipologia: Tipologia;
  capitulo?: Capitulo;
  video?: Video;
  pelicula?: Pelicula;
  documental?: Documental;
  eventotipologia?: any;
  curso?: any;
  modelo?: string;
  live?: any;
}

export interface Publication {
  'url_imagen': string;
  'canal_url_avatar': string;
  'id': number;
  'nombre': string;
  'descripcion': string;
  'publicado': boolean;
  'categoria': Categoria;
  'palabraClave': string;
  'tipo': string;
  'url_manifiesto': string;
  'url_descarga': string;
  'url_subtitulo': string;
  'duracion': string;
  'cantidad_visitas': number;
  'cantidad_reproducciones': number;
  'cantidad_me_gusta': number;
  'cantidad_no_me_gusta': number;
  'cantidad_vistas_ahora': number;
  'cantidad_comentarios': number;
  'canal': Canal;
  'canal_id': number;
  'canal_slug_url': string;
  'premium': boolean;
  'only_subs': boolean;
  'mostrar_chat': boolean;
  'mostrar_comentarios': boolean;
  'precios': {
    tipo: string,
    valor: number
  }[];
  'precio_id': number;
  lista_reproduccion_canal?: any[];
  'hd': boolean;
  'fecha_creacion': Date;
  'fecha_publicado': string;
  'convertido': boolean;
  'usuario': string;
  'slug_url': string;
  'cantidad_descargas': number;
  'descarga': string;
  'usuario_username': string;
  'descargable': boolean;
  'tiempo_creacion': string;
  'lista_comentarios': PictaResponse<Comentario>;
  'active': boolean;
  'imagen_secundaria': string;
  time: number;
  live?: any;
  pd? : boolean
  pr? : boolean
  'audios'?: string;
  'subtitulos'?: string[];
  'cantidad_temporadas'?: number;
  'cantidad_capitulos'?: number;
  'ano'?: string;
}
