export type ActiveSection = 'poet' | 'curiosities' | 'computer' | 'diary' | 'cms' | 'admin';

export interface Poem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  theme: 'Love' | 'Existentialism' | 'Memory' | 'Transience';
  stanzas: string[][];
  quoteExcerpt?: string;
  dedication?: string;
}

export interface CuriosityEssay {
  id: string;
  title: string;
  category: 'F1 Aerodynamics' | '90s Combustion' | 'Mechanical Horology' | 'Urban Geography';
  readTime: string;
  year: string;
  summary: string;
  content: string[];
  keyDiagramNotes?: {
    term: string;
    definition: string;
  }[];
  specSheet?: {
    label: string;
    value: string;
  }[];
}

export interface CodeBlockItem {
  id: string;
  filename: string;
  language: 'python' | 'bash' | 'c' | 'rust';
  code: string;
  annotations?: string;
}

export interface ComputerArticle {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  category: 'OSINT Reconnaissance' | 'Systems Philosophy' | 'Low-Level Networking';
  philosophicalThesis: string;
  body: string[];
  codeBlocks: CodeBlockItem[];
}

export interface DiaryPost {
  id: string;
  title: string;
  date: string;
  time: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  mood?: string;
  weather?: string;
  location?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'flagged';
  isAdmin?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  section: 'diary' | 'curiosities' | 'computer' | 'poet';
  sectionLabel: string;
  summary: string;
  matchExcerpt: string;
  dateOrCategory: string;
}

