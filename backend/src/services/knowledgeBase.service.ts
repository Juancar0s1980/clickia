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

function normalize(text: string): string {
  return Array.from(text.toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      return code < COMBINING_MARK_MIN || code > COMBINING_MARK_MAX;
    })
    .join("");
}

function scoreProblem(problem: TechnicalProblem, tokens: string[]): number {
  const haystack = normalize(`${problem.nombre} ${problem.categoria} ${problem.descripcion}`);
  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

// Paso de "Retrieval" del flujo RAG (Fase 4 anade la generacion sobre este contexto).
export const knowledgeBaseService = {
  async findRelevantProblem(userMessage: string): Promise<KnowledgeMatch | null> {
    const tokens = normalize(userMessage)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2);

    if (tokens.length === 0) {
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
