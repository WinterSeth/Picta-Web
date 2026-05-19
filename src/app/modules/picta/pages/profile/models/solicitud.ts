export interface Solicitud {
  tipo: 'creacion_canal' | 'seller';
  fecha?: Date;
  aceptada?: boolean;
  id?: number;
  data: {
    name: string,
    email: string,
    address: string,
    ci: number,
    account: string,
  } | {
    palabraClave: string,
    url_imagen: string,
    url_avatar: string,
    prioridad: number,
    usuarios_asociados: string,
    publicado: string,
  };
}
