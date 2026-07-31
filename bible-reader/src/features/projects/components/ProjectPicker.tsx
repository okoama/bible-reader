import { useEffect, useState } from 'react';
import { ResearchProjectRepository } from '../../../lib/repositories/ResearchProjectRepository';
import type { ResearchProject } from '../../../types';

const repo = new ResearchProjectRepository();

type ProjectPickerProps = {
  value?: string;
  onChange: (projectId: string | undefined) => void;
};

export default function ProjectPicker({ value, onChange }: ProjectPickerProps) {
  const [projects, setProjects] = useState<ResearchProject[]>([]);

  useEffect(() => {
    let active = true;
    void repo.findAll().then((all) => { if (active) setProjects(all); });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium opacity-60">Project</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-accent"
      >
        <option value="">None</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.icon} {p.title}</option>
        ))}
      </select>
    </div>
  );
}
