export interface Playlist {
  id:              number;
  fecha_creacion:  Date;
  nombre:          string;
  tipo:            string;
  canal:           Canal;
  score:           number;
  publicado:       boolean;
  internacional:   boolean;
  publicaciones:   any[];
  tiempo_creacion: string;
  url_imagen:      string;
}

export interface Canal {
  nombre:             string;
  id:                 number;
  slug_url:           string;
  alias:              string;
  usuario:            Usuario;
  usuarios_asociados: Usuario[];
}

export interface Usuario {
  username: string;
}
