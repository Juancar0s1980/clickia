import { solutionRepository } from "../repositories/solution.repository";
import { technicalProblemRepository } from "../repositories/technicalProblem.repository";
import { Solution } from "../models/solution.model";
import { TechnicalProblem } from "../models/technicalProblem.model";

export interface KnowledgeMatch {
  problem: TechnicalProblem;
  solutions: Solution[];
  score: number;
}

const COMBINING_MARK_MIN = 0x0300;
const COMBINING_MARK_MAX = 0x036f;

// Palabras demasiado comunes en espanol como para ser una senal util de que problema
// describe el usuario; sin este filtro coinciden por casualidad con casi cualquier
// descripcion (ej. "una" aparece dentro de "muestra una luz...").
const STOPWORDS = new Set([
  "que", "los", "las", "una", "uno", "unos", "unas", "con", "para", "del", "desde",
  "hola", "buenas", "tengo", "tiene", "esta", "esto", "ese", "esa", "como", "porque",
  "cuando", "donde", "muy", "mas", "pero", "hay", "por", "sin", "sus", "mis", "les",
  "duda", "favor", "gracias", "ayuda", "ayudar",
]);

function normalize(text: string): string {
  return Array.from(text.toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      return code < COMBINING_MARK_MIN || code > COMBINING_MARK_MAX;
    })
    .join("");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function scoreProblem(problem: TechnicalProblem, wordSet: Set<string>): number {
  const haystackWords = new Set(tokenize(`${problem.nombre} ${problem.categoria} ${problem.descripcion}`));
  let score = 0;
  for (const token of wordSet) {
    if (haystackWords.has(token)) {
      score += 1;
    }
  }
  return score;
}

// Paso de "Retrieval" del flujo RAG (Fase 4 anade la generacion sobre este contexto).
// Coincidencia por palabra completa (no substring) para evitar falsos positivos con
// palabras cortas o comunes.
export const knowledgeBaseService = {
  async findRelevantProblem(userMessage: string): Promise<KnowledgeMatch | null> {
    const tokens = new Set(tokenize(userMessage));

    if (tokens.size === 0) {
      return null;
    }

    const problems = await technicalProblemRepository.findAll();
    let best: { problem: TechnicalProblem; score: number } | null = null;

    for (const problem of problems) {
      const score = scoreProblem(problem, tokens);
      if (score > 0 && (!best || score > best.score)) {
        best = { problem, score };
      }
    }

    if (!best) {
      return null;
    }

    const solutions = await solutionRepository.findByProblemId(best.problem.id);
    return { problem: best.problem, solutions, score: best.score };
  },
};
