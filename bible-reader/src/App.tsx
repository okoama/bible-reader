import AppLayout from "./layouts/AppLayout";
import { StudySessionProvider } from "./lib/contexts/StudySessionContext";
import { WorkspaceSettingsProvider } from "./lib/contexts/WorkspaceSettingsContext";
import ErrorBoundary from "./features/shared/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary variant="full">
      <WorkspaceSettingsProvider>
        <StudySessionProvider>
          <AppLayout />
        </StudySessionProvider>
      </WorkspaceSettingsProvider>
    </ErrorBoundary>
  );
}