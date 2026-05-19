import {Publication} from '../../medias/models/publicacion.model';

export interface Section {
  'id': number
  'nombre': string
  'estilo': string
  'prioridad': number
  'activo': boolean
  'fecha': Date
  'fecha_ini': Date
  'fecha_fin': Date
  'filtros': []
  'videos': Publication[]
  'next'?: string
  'canal'?: any

}
