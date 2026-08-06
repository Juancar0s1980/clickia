export type UserRole = "user" | "admin";
export type TipoServicio = "wifi" | "tv" | "wifi_tv";
export type Zona = "Centro" | "Norte" | "Sur" | "Occidente" | "Timbío";

export interface User {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  telefono: string | null;
  direccion: string;
  zona: Zona | null;
  acepto_datos: boolean;
  acepto_datos_at: Date | null;
  role: UserRole;
  tipo_servicio: TipoServicio;
  activo: boolean;
  fecha_creacion: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, "password_hash">;

export function toPublicUser(user: User): PublicUser {
  const { password_hash: _password_hash, ...publicUser } = user;
  return publicUser;
}
