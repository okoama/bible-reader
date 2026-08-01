import { useCallback, useEffect, useRef, useState } from 'react';
import type { ResearchProject, ProjectStatus } from '../../../types';
import { PROJECT_STATUSES, PROJECT_DEFAULT_ICONS } from '../../../types';
import AsyncButton from '../../shared/components/AsyncButton';

type ProjectEditorProps = {
  project?: ResearchProject;
  onSave: (title: string, description: string, status: ProjectStatus, icon: string, color: string) => void | Promise<void>;
  onCancel: () => void;
};

const COLOR_OPTIONS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#be185d', '#65a30d'];

export default function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'draft');
  const [icon, setIcon] = useState(project?.icon ?? PROJECT_DEFAULT_ICONS[0]);
  const [color, setColor] = useState(project?.color ?? COLOR_OPTIONS[0]);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSubmit = useCallback(() => {
    if (title.trim()) return onSave(title.trim(), description.trim(), status, icon, color);
  }, [title, description, status, icon, color, onSave]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project ? 'Edit project' : 'New project'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl animate-slide-up" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}>
        <h2 className="text-lg font-semibold">{project ? 'Edit Project' : 'New Project'}</h2>

        <input ref={nameRef} type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Project title" className="focus-accent rounded-md border px-3 py-2 text-sm outline-none" />

        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} aria-label="Project description" className="focus-accent rounded-md border px-3 py-2 text-sm outline-none resize-none" />

        <div role="group" aria-label="Project status">
          <span className="text-xs font-medium opacity-60" id="status-label">Status</span>
          <div className="mt-1 flex gap-2" role="radiogroup" aria-labelledby="status-label">
            {PROJECT_STATUSES.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs capitalize transition-colors focus-visible:ring-2 focus-visible:ring-accent ${status === s ? 'bg-accent text-white' : 'border hover-bg'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Project icon">
          <span className="text-xs font-medium opacity-60">Icon</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {PROJECT_DEFAULT_ICONS.map((ic) => (
              <button key={ic} type="button" aria-label={`Icon ${ic}`} aria-pressed={icon === ic} onClick={() => setIcon(ic)} className={`h-8 w-8 rounded text-lg transition-transform focus-visible:ring-2 focus-visible:ring-accent ${icon === ic ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}>{ic}</button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Project color">
          <span className="text-xs font-medium opacity-60">Color</span>
          <div className="mt-1 flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-400 ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm transition-colors hover-bg focus-visible:ring-2 focus-visible:ring-accent">Cancel</button>
          <AsyncButton onClick={handleSubmit} disabled={!title.trim()} busyLabel="Saving…" className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent">{project ? 'Save' : 'Create'}</AsyncButton>
        </div>
      </div>
    </div>
  );
}
