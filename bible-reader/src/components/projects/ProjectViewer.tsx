import { useEffect, useState } from 'react';
import type { ResearchProject, ProjectStatus } from '../../types';
import { ResearchProjectRepository } from '../../lib/repositories/ResearchProjectRepository';
import { PROJECT_STATUSES } from '../../types';
import { formatDate } from '../../lib/utils/date';

const repo = new ResearchProjectRepository();

type Props = {
  projectId: string;
  refreshKey: number;
  onBack: () => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ProjectStatus) => void;
};

export default function ProjectViewer({ projectId, refreshKey, onBack, onEdit, onDelete, onStatusChange }: Props) {
  const [project, setProject] = useState<ResearchProject | null>(null);

  useEffect(() => {
    let active = true;
    void repo.findById(projectId).then((p) => { if (active && p) setProject(p); });
    return () => { active = false; };
  }, [projectId, refreshKey]);

  if (!project) {
    return <div className="mx-auto reading-width animate-fade-in"><p className="mt-12 text-center text-sm italic opacity-50">Loading...</p></div>;
  }

  return (
    <div className="mx-auto reading-width animate-fade-in">
      <div className="mb-6">
        <button type="button" onClick={onBack} className="mb-3 text-sm text-accent hover:text-accent-hover">&larr; Projects</button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl" style={{ color: project.color }}>{project.icon}</span>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">{project.title}</h2>
                <span className={`rounded-full px-3 py-0.5 text-xs capitalize font-medium ${
                  project.status === 'active' ? 'bg-accent-light text-accent' :
                  project.status === 'completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                  'bg-gray-200 text-gray-500'
                }`}>{project.status}</span>
              </div>
              {project.description && <p className="mt-1 text-sm opacity-60">{project.description}</p>}
              <p className="mt-1 text-xs opacity-40">Created {formatDate(project.createdAt)} &middot; Updated {formatDate(project.updatedAt)}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={() => onEdit(project)} className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-100">Edit</button>
            <button type="button" onClick={() => onDelete(project.id)} className="rounded border px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50">Delete</button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60 mb-2">Status</h3>
        <div className="flex gap-2">
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(project.id, s)}
              className={`rounded-full px-4 py-1.5 text-xs capitalize transition-colors ${
                project.status === s ? 'bg-accent text-white' : 'border hover:bg-gray-50'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm italic opacity-40">Project workspace coming soon — notes, references, and milestones.</p>
      </div>
    </div>
  );
}
