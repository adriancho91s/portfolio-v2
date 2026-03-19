'use client';

import {
  BrainCircuit,
  Server,
  Monitor,
  Database,
  Link2,
  Cloud,
  Code2,
  Wrench,
} from 'lucide-react';
import { cn } from '@lib/utils';
import { ShimmerCard } from '@components/ui/ShimmerCard';

interface Category {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** accent-secondary (cyan) for AI, accent (indigo) for others */
  accent: 'primary' | 'secondary';
  skills: string[];
}

const CATEGORIES: Category[] = [
  {
    name: 'AI & Agents',
    Icon: BrainCircuit,
    accent: 'secondary',
    skills: ['Claude API', 'OpenAI', 'Gemini', 'AI Agents', 'Multi-agent Orchestration', 'Agentic Systems', 'MCP Servers', 'RAG', 'LLM Integration', 'SSE Streaming', 'Tool-use Patterns'],
  },
  {
    name: 'Backend',
    Icon: Server,
    accent: 'primary',
    skills: ['Node.js', 'NestJS', 'Laravel', 'BullMQ', 'TypeORM', 'Event-Driven Architecture', 'Microservices', 'RESTful APIs', 'WebSocket'],
  },
  {
    name: 'Frontend',
    Icon: Monitor,
    accent: 'primary',
    skills: ['React', 'Next.js', 'Astro', 'Redux', 'Redux Toolkit', 'RTK Query', 'TailwindCSS', 'Framer Motion', 'Three.js', 'Flutter'],
  },
  {
    name: 'Databases',
    Icon: Database,
    accent: 'primary',
    skills: ['PostgreSQL', 'MySQL', 'Redis'],
  },
  {
    name: 'Blockchain',
    Icon: Link2,
    accent: 'secondary',
    skills: ['Solidity', 'Avalanche', 'Ethereum', 'ERC721', 'EIP-2981', 'Hardhat', 'IPFS', 'Custodial Wallets'],
  },
  {
    name: 'DevOps & Cloud',
    Icon: Cloud,
    accent: 'primary',
    skills: ['Docker', 'AWS', 'Firebase', 'CI/CD', 'Nginx', 'GCP', 'DigitalOcean', 'Vercel'],
  },
  {
    name: 'Languages',
    Icon: Code2,
    accent: 'primary',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Dart', 'PHP', 'Solidity', 'SQL', 'C'],
  },
  {
    name: 'APIs & Tools',
    Icon: Wrench,
    accent: 'secondary',
    skills: ['Twilio', 'Stripe', 'Git', 'GitHub', 'Puppeteer', 'Prisma', 'Drizzle'],
  },
];

function SkillCard({ category }: { category: Category }) {
  const { name, Icon, accent, skills } = category;
  const isSecondary = accent === 'secondary';

  return (
    <ShimmerCard
      className={cn(
        'rounded-2xl border overflow-hidden transition-all duration-300',
        'bg-surface-elevated border-border',
        'hover:border-accent-border hover:-translate-y-0.5',
      )}
    >
      <div className="relative z-10 p-7 flex flex-col gap-5">

        {/* Icon + category name */}
        <div className="flex items-center gap-3">
          {/* Icon container with accent glow */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300',
              isSecondary
                ? 'bg-accent-sub border-accent-secondary/30 text-accent-secondary group-hover:shadow-[0_0_16px_rgba(0,212,255,0.3)]'
                : 'bg-accent-sub border-accent/30 text-accent group-hover:shadow-[0_0_16px_var(--accent-glow)]',
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          <h3 className="text-base font-semibold tracking-tight text-fg">
            {name}
          </h3>
        </div>

        {/* Skill chips */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-3 py-1 rounded-full border text-fg-muted border-border bg-surface transition-colors duration-200 group-hover:text-fg group-hover:border-accent/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </ShimmerCard>
  );
}

export function SkillsInteractive() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {CATEGORIES.map((cat) => (
        <SkillCard key={cat.name} category={cat} />
      ))}
    </div>
  );
}
