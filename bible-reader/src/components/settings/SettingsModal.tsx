import { useWorkspaceSettings } from '../../lib/contexts/WorkspaceSettingsContext';
import { ACCENT_NAMES } from '../../types';
import { ACCENT_COLORS } from '../../lib/utils/accent';
import type { WorkspaceSettings } from '../../types';

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

export default function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings, resetSettings } = useWorkspaceSettings();

  const set = (patch: Partial<WorkspaceSettings>) => updateSettings(patch);

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

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
