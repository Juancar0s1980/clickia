import { pool } from "../config/database";
import { User } from "../models/user.model";

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
    telefono?: string;
  }): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (nombre, email, password_hash, telefono)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.nombre, input.email, input.passwordHash, input.telefono ?? null],
    );
    return rows[0]!;
  },
};
