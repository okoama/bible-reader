import { useRef, useState } from 'react';
import { useWorkspaceSettings } from '../../lib/contexts/WorkspaceSettingsContext';
import { ACCENT_NAMES } from '../../types';
import { ACCENT_COLORS } from '../../lib/utils/accent';
import { BackupService } from '../../lib/services/BackupService';
import type { WorkspaceSettings, WorkspaceBackup } from '../../types';

type Props = { onClose: () => void };

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs opacity-60">{value}{label === 'Font Size' ? 'px' : 'px'}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" />
    </div>
  );
}

const backupService = new BackupService();

export default function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings, resetSettings } = useWorkspaceSettings();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<WorkspaceSettings>) => updateSettings(patch);

  const handleExport = async () => {
    try {
      const backup = await backupService.exportBackup();
      backupService.downloadBackup(backup);
      setMessage({ text: 'Backup downloaded successfully.', type: 'success' });
    } catch (err) {
      setMessage({ text: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`, type: 'error' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup: WorkspaceBackup = JSON.parse(text);
      await backupService.importBackup(backup);
      setMessage({ text: 'Import successful. Close settings and refresh the page to see your restored workspace.', type: 'success' });
    } catch (err) {
      setMessage({ text: `Import failed: ${err instanceof Error ? err.message : 'Invalid file'}`, type: 'error' });
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">Workspace Settings</h2>

        <div className="mt-5 space-y-5">
          <Slider label="Sidebar Width" value={settings.sidebarWidth} min={160} max={400} step={8} onChange={(v) => set({ sidebarWidth: v })} />
          <Slider label="Right Panel Width" value={settings.rightPanelWidth} min={200} max={500} step={8} onChange={(v) => set({ rightPanelWidth: v })} />
          <Slider label="Font Size" value={settings.fontSize} min={12} max={24} step={1} onChange={(v) => set({ fontSize: v })} />
          <Slider label="Reading Width" value={settings.readingWidth} min={480} max={1200} step={16} onChange={(v) => set({ readingWidth: v })} />

          <div>
            <span className="text-sm">Accent Color</span>
            <div className="mt-2 flex gap-3">
              {ACCENT_NAMES.map((name) => {
                const colors = ACCENT_COLORS[name];
                const isActive = settings.accent === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => set({ accent: name })}
                    className={`h-8 w-8 rounded-full transition-transform ${isActive ? 'scale-125 ring-2 ring-offset-2' : 'hover:scale-110'}`}
                    style={{ backgroundColor: colors.base }}
                    title={name}
                  />
                );
              })}
            </div>
          </div>

          <button type="button" onClick={resetSettings} className="text-xs opacity-50 hover:opacity-100">
            Reset to defaults
          </button>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Backup & Restore</h3>
          <div className="flex gap-2">
            <button type="button" onClick={handleExport} className="rounded border px-3 py-1.5 text-xs hover:bg-gray-100">
              Export Backup
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded border px-3 py-1.5 text-xs hover:bg-gray-100">
              Import Backup
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {message && (
            <p className={`text-xs ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
              {message.text}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
