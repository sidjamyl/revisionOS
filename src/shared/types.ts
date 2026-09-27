export type SourceKind = 'course' | 'td' | 'exam' | 'syllabus';

export type Source = {
  id: string;
  kind: SourceKind;
  title: string;
  page: number | null;
  excerpt: string;
  url: string | null;
  year?: number | null;
  question?: string | null;
  points?: number | null;
  estimatedPoints?: boolean;
  isDemonstration?: boolean;
};

export type Topic = {
  id: string;
  title: string;
  chapter: string;
  summary: string;
  prerequisites: string[];
  sources: Source[];
  confidence: number;
};

export type ExamOccurrence = {
  examId: string;
  year: number;
  topicId: string;
  points: number | null;
  totalPoints: number | null;
  question: string;
  sourceId: string | null;
  estimatedPoints?: boolean;
};

export type QuizQuestion = {
  id: string;
  topicId: string;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
};

export type ModuleData = {
  id: string;
  title: string;
  institution: string;
  program: string;
  level: string;
  topics: Topic[];
  occurrences: ExamOccurrence[];
  quiz: QuizQuestion[];
  isDemonstration: boolean;
  updatedAt: string;
};

export type CatalogModule = {
  id: string;
  title: string;
  level: string;
  ready: boolean;
  sourceUrl: string;
};

export type CatalogProgram = {
  id: string;
  institution: string;
  title: string;
  modules: CatalogModule[];
};

export type RoadmapTopic = Topic & {
  layer: number;
  importance: number;
  essential: boolean;
  appearanceCount: number;
  examCount: number;
  averagePoints: number | null;
};

export type Roadmap = {
  module: Omit<ModuleData, 'topics' | 'occurrences' | 'quiz'>;
  topics: RoadmapTopic[];
  examDays: number | null;
  isDemonstration: boolean;
};
