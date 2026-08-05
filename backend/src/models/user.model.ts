export interface User {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  telefono: string | null;
  activo: boolean;
  fecha_creacion: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, "password_hash">;

export function toPublicUser(user: User): PublicUser {
  const { password_hash: _password_hash, ...publicUser } = user;
  return publicUser;
}
