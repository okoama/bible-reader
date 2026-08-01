import AppLayout from "./layouts/AppLayout";
import { StudySessionProvider } from "./lib/contexts/StudySessionContext";
import { WorkspaceSettingsProvider } from "./lib/contexts/WorkspaceSettingsContext";

export default function App() {
  return (
    <WorkspaceSettingsProvider>
      <StudySessionProvider>
        <AppLayout />
      </StudySessionProvider>
    </WorkspaceSettingsProvider>
  );
}