import type { Level, Question, QuestionBank } from './types';

type BankModule = { bank: QuestionBank };

const modules = import.meta.glob<BankModule>('./*.ts', { eager: true });

export const banks: QuestionBank[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/index.ts') && !path.endsWith('/types.ts'))
  .map(([, m]) => m.bank);

export type IndexedQuestion = Question & { topic: string };

export const allQuestions: IndexedQuestion[] = banks.flatMap((b) =>
  b.questions.map((q) => ({ ...q, topic: b.topic })),
);

export const levels: Level[] = ['junior', 'mid', 'senior', 'staff'];

export const topics: string[] = banks.map((b) => b.topic).sort();

export type { Level, Question, QuestionBank } from './types';
