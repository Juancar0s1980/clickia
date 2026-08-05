import { pool } from "../config/database";
import { NetworkServiceStatus, NetworkStatusRow } from "../models/networkStatus.model";

export const networkStatusRepository = {
  async findByZone(zone: string): Promise<NetworkStatusRow | null> {
    const { rows } = await pool.query<NetworkStatusRow>(
      "SELECT * FROM network_status WHERE lower(zone) = lower($1)",
      [zone],
    );
    return rows[0] ?? null;
  },

  async findAll(): Promise<NetworkStatusRow[]> {
    const { rows } = await pool.query<NetworkStatusRow>("SELECT * FROM network_status ORDER BY zone");
    return rows;
  },

  async upsert(input: {
    zone: string;
    status: NetworkServiceStatus;
    estimatedTime: string | null;
  }): Promise<NetworkStatusRow> {
    const { rows } = await pool.query<NetworkStatusRow>(
      `INSERT INTO network_status (zone, status, estimated_time, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (zone)
       DO UPDATE SET status = $2, estimated_time = $3, updated_at = now()
       RETURNING *`,
      [input.zone, input.status, input.estimatedTime],
    );
    return rows[0]!;
  },
};
