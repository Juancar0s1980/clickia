import { pool } from "../config/database";
import { TipoServicio, User, UserRole, Zona } from "../models/user.model";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<User>("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ?? null;
  },

  async create(input: {
    nombre: string;
    email: string;
    passwordHash: string;
    direccion: string;
    telefono?: string;
    zona?: Zona;
    role?: UserRole;
    tipoServicio?: TipoServicio;
    // Solo lo trae el registro propio (la persona aceptando por si misma); las cuentas
    // creadas por un admin quedan en false por defecto.
    aceptoDatos?: boolean;
  }): Promise<User> {
    const aceptoDatos = input.aceptoDatos ?? false;
    const { rows } = await pool.query<User>(
      `INSERT INTO users (nombre, email, password_hash, direccion, telefono, zona, role, tipo_servicio, acepto_datos, acepto_datos_at)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'user'), COALESCE($8, 'wifi'), $9, CASE WHEN $9 THEN now() ELSE NULL END)
       RETURNING *`,
      [
        input.nombre,
        input.email,
        input.passwordHash,
        input.direccion,
        input.telefono ?? null,
        input.zona ?? null,
        input.role ?? null,
        input.tipoServicio ?? null,
        aceptoDatos,
      ],
    );
    return rows[0]!;
  },

  async findAll(): Promise<User[]> {
    const { rows } = await pool.query<User>("SELECT * FROM users ORDER BY fecha_creacion DESC");
    return rows;
  },

  async setRole(id: string, role: UserRole): Promise<void> {
    await pool.query("UPDATE users SET role = $1, updated_at = now() WHERE id = $2", [role, id]);
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await pool.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [passwordHash, id]);
  },
};
