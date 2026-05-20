export type Level = 'junior' | 'mid' | 'senior' | 'staff';

export type Question = {
  level: Level;
  question: string;
  answer: string;
};

export type QuestionBank = {
  topic: string;
  questions: Question[];
};
