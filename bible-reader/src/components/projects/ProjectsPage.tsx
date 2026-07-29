import { useEffect, useState } from 'react';
import type { ResearchProject } from '../../types';
import { ResearchProjectRepository } from '../../lib/repositories/ResearchProjectRepository';

const repo = new ResearchProjectRepository();

type Props = {
  refreshKey: number;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-accent text-white',
  draft: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-200 text-gray-500',
};

export default function ProjectsPage({ refreshKey, onSelectProject, onNewProject }: Props) {
  const [projects, setProjects] = useState<ResearchProject[]>([]);

  useEffect(() => {
    let active = true;
    void repo.findAll().then((all) => { if (active) setProjects(all); });
    return () => { active = false; };
  }, [refreshKey]);

  return (
    <div className="mx-auto reading-width animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Research Projects</h2>
        <button type="button" onClick={onNewProject} className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover">+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <p className="mt-12 text-center text-sm italic opacity-50">Research projects help you organize study around a theme or question.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProject(p.id)} className="rounded-lg border p-5 text-left transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold truncate">{p.title}</p>
                  {p.description && <p className="mt-0.5 text-sm opacity-60 line-clamp-2">{p.description}</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_COLORS[p.status] ?? 'bg-gray-100'}`}>{p.status}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
