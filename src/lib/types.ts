export interface QuizQuestion {
  id: string;
  prompt: string;
  imageUrl?: string;
  questionInputMode?: "text" | "image";
  status?: "draft" | "live";
  questionType: "MCQ" | "True/False" | "Short" | string;
  options?: string[];
  answer?: string;
  explanation?: string;
  tips?: string;
  timeLimitMinutes?: number;
  marks?: number;
  persisted?: boolean;
  dirty?: boolean;
}

export interface QuizSection {
  id: string;
  label: string;
  status?: "draft" | "live";
  heading?: string;
  bloomLevel?: string;
  targetMarks?: number;
  targetTimeMinutes?: number;
  questions?: QuizQuestion[];
}

export interface QuizStats {
  questions: number;
  marks: number;
  minutes: number;
}

export interface StoredQuiz {
  id: string;
  courseId: string;
  level: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  imageUrl?: string;
  status?: "draft" | "live";
  questionType: string;
  difficulty: string;
  sectionLabel?: string;
  sectionHeading?: string;
  bloomLevel?: string;
  targetMarks?: number;
  targetTimeMinutes?: number;
  sectionOrder?: number;
  questionOrder?: number;
}

export interface QuizSetSummary {
  id: string;
  courseId: string;
  title: string;
  classLevel: string;
  difficulty?: string;
  status: "draft" | "live";
  order?: number;
  _count?: {
    questions?: number;
    sections?: number;
  };
}
