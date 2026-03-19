export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url: string | null;
  github: string | null;
  featured: boolean;
  order: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null; // null = present
  achievements: string[];
  type: 'work' | 'education';
  order: number;
}

export interface Skill {
  name: string;
  category: 'ai' | 'backend' | 'frontend' | 'databases' | 'blockchain' | 'cloud' | 'tools';
}

export type Theme = 'dark' | 'light';
