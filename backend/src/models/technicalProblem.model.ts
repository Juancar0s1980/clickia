export type ProblemNivel = "bajo" | "medio" | "alto";

export interface TechnicalProblem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  nivel: ProblemNivel;
}
