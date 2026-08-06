export interface Diagnostic {
  id: string;
  conversation_id: string;
  problem_id: string | null;
  zone: string | null;
  network_status: string | null;
  fecha_creacion: Date;
}

export interface TopProblemRow {
  problem_id: string;
  nombre: string;
  categoria: string;
  total: string; // COUNT(*) de Postgres viene como string
}
