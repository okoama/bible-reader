import { useEffect, useRef, useState } from 'react';
import type { ResearchProject, ProjectStatus } from '../../types';
import { PROJECT_STATUSES, PROJECT_DEFAULT_ICONS } from '../../types';

type Props = {
  project?: ResearchProject;
  onSave: (title: string, description: string, status: ProjectStatus, icon: string, color: string) => void;
  onCancel: () => void;
};

const COLOR_OPTIONS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#be185d', '#65a30d'];

export default function ProjectEditor({ project, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'draft');
  const [icon, setIcon] = useState(project?.icon ?? PROJECT_DEFAULT_ICONS[0]);
  const [color, setColor] = useState(project?.color ?? COLOR_OPTIONS[0]);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">{project ? 'Edit Project' : 'New Project'}</h2>

        <input ref={nameRef} type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} className="focus-accent rounded-md border px-3 py-2 text-sm outline-none" />

        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="focus-accent rounded-md border px-3 py-2 text-sm outline-none resize-none" />

        <div>
          <span className="text-xs font-medium opacity-60">Status</span>
          <div className="mt-1 flex gap-2">
            {PROJECT_STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${status === s ? 'bg-accent text-white' : 'border hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium opacity-60">Icon</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {PROJECT_DEFAULT_ICONS.map((ic) => (
              <button key={ic} type="button" onClick={() => setIcon(ic)} className={`h-8 w-8 rounded text-lg transition-transform ${icon === ic ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}>{ic}</button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium opacity-60">Color</span>
          <div className="mt-1 flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`h-6 w-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-100">Cancel</button>
          <button type="button" disabled={!title.trim()} onClick={() => onSave(title.trim(), description.trim(), status, icon, color)} className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50">{project ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
