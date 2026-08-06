import { solutionRepository } from "../repositories/solution.repository";
import { technicalProblemRepository } from "../repositories/technicalProblem.repository";
import { Message } from "../models/message.model";
import { Solution } from "../models/solution.model";
import { TechnicalProblem } from "../models/technicalProblem.model";
import { tokenize as baseTokenize } from "../utils/text";

export interface KnowledgeMatch {
  problem: TechnicalProblem;
  solutions: Solution[];
  score: number;
}

// Palabras demasiado comunes en espanol como para ser una senal util de que problema
// describe el usuario; sin este filtro coinciden por casualidad con casi cualquier
// descripcion (ej. "una" aparece dentro de "muestra una luz...").
const STOPWORDS = new Set([
  "que", "los", "las", "una", "uno", "unos", "unas", "con", "para", "del", "desde",
  "hola", "buenas", "tengo", "tiene", "esta", "esto", "ese", "esa", "como", "porque",
  "cuando", "donde", "muy", "mas", "pero", "hay", "por", "sin", "sus", "mis", "les",
  "duda", "favor", "gracias", "ayuda", "ayudar",
]);

function tokenize(text: string): string[] {
  return baseTokenize(text, 3).filter((t) => !STOPWORDS.has(t));
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

function bestMatch(problems: TechnicalProblem[], tokens: Set<string>): { problem: TechnicalProblem; score: number } | null {
  if (tokens.size === 0) {
    return null;
  }
  let best: { problem: TechnicalProblem; score: number } | null = null;
  for (const problem of problems) {
    const score = scoreProblem(problem, tokens);
    if (score > 0 && (!best || score > best.score)) {
      best = { problem, score };
    }
  }
  return best;
}

// Paso de "Retrieval" del flujo RAG (Fase 4 anade la generacion sobre este contexto).
// Coincidencia por palabra completa (no substring) para evitar falsos positivos con
// palabras cortas o comunes.
export const knowledgeBaseService = {
  async findRelevantProblem(userMessage: string, history: Message[] = []): Promise<KnowledgeMatch | null> {
    const problems = await technicalProblemRepository.findAll();

    let best = bestMatch(problems, new Set(tokenize(userMessage)));

    // Mensajes de seguimiento como "sigue sin funcionar" no traen señales propias del
    // problema; se reintenta sumando los mensajes previos del usuario en la misma
    // conversación para no perder el hilo del diagnóstico ya iniciado.
    if (!best && history.length > 0) {
      const priorUserText = history
        .filter((m) => m.sender === "user")
        .map((m) => m.message)
        .join(" ");
      best = bestMatch(problems, new Set(tokenize(`${priorUserText} ${userMessage}`)));
    }

    if (!best) {
      return null;
    }

    const solutions = await solutionRepository.findByProblemId(best.problem.id);
    return { problem: best.problem, solutions, score: best.score };
  },
};
