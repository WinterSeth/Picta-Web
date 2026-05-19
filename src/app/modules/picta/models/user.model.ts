export interface UserModel {
  'id': number
  'avatar': string
  'groups': any []
  'password': string
  'username': string
  'first_name': string
  'last_name': string
  'phone_number': string
  'email': string
  'fecha_nacimiento': Date,
  'code': string;
  dias_restantes?: number;
  days_remaining?: number;
  remaining_days?: number;
  aprobacion_solicitudes: {
    solicitud_canal: boolean;
    solicitud_seller: boolean;
  },
  subscription_plan: {
    nombre?: string;
    name?: string;
    estado?: string;
    status?: string;
    activo?: boolean;
    is_active?: boolean;
    dias_restantes?: number;
    days_remaining?: number;
    remaining_days?: number;
    fecha_fin?: string;
    end_date?: string;
    fecha_vencimiento?: string;
    vencimiento?: string;
    expires_at?: string;
    plan?: {
      nombre?: string;
      name?: string;
      estado?: string;
      status?: string;
      activo?: boolean;
      is_active?: boolean;
      dias_restantes?: number;
      days_remaining?: number;
      remaining_days?: number;
      fecha_fin?: string;
      end_date?: string;
      fecha_vencimiento?: string;
      vencimiento?: string;
      expires_at?: string;
      beneficios?: {
        nombre_raw: string;
        valor: string;
      }[];
    };
    beneficios: {
      nombre_raw: string;
      valor: string;
    }[];
  }
}
